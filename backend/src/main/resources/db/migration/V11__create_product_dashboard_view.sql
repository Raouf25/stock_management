-- V11: Materialized view for the product dashboard
--
-- Replaces the 12-correlated-subquery JPQL in ProductRepository.findProductsDashboardData().
-- The view pre-aggregates sale, bill_product, and purchase per product so the
-- dashboard reads a single indexed scan instead of N×6 subqueries.
--
-- Refresh strategy: call REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_dashboard
-- from ProductDashboardService.onDataChanged() after every sale / purchase / bill save.
-- CONCURRENTLY allows reads during the refresh (requires the unique index below).

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_product_dashboard AS
SELECT
    p.id_product,
    p.reference,
    p.name,
    p.category,
    p.unit,
    p.unit_price,
    p.unit_price_sold,
    p.current_stock_quantity,

    -- total units sold = standalone sales + bill line items
    COALESCE(s.qty_sold,    0) + COALESCE(bp.qty_billed,  0) AS total_quantity_sold,

    -- warehouse stock = purchased - (standalone sales + bill items)
    COALESCE(pur.qty_purchased, 0)
        - COALESCE(s.qty_sold,   0)
        - COALESCE(bp.qty_billed, 0)                          AS stock_warehouse,

    COALESCE(pur.purchase_count, 0)                           AS purchases_count,
    COALESCE(pur.avg_purchase_price, 0)                       AS average_purchase_price,

    COALESCE(s.sale_count, 0) + COALESCE(bp.bill_count, 0)   AS sales_count,

    -- average sale price = total revenue / total units (NULL-safe division)
    COALESCE(
        (COALESCE(s.total_sale_amount,    0) + COALESCE(bp.total_billed_amount, 0))
        / NULLIF(COALESCE(s.qty_sold, 0) + COALESCE(bp.qty_billed, 0), 0)
    , 0)                                                       AS average_sale_price,

    -- bilan = revenue - cost
    COALESCE(s.total_sale_amount,    0)
        + COALESCE(bp.total_billed_amount,   0)
        - COALESCE(pur.total_purchase_amount, 0)              AS bilan

FROM product p

LEFT JOIN (
    SELECT
        product_id,
        SUM(quantity_sold)     AS qty_sold,
        COUNT(*)               AS sale_count,
        SUM(total_sale_amount) AS total_sale_amount
    FROM sale
    GROUP BY product_id
) s ON s.product_id = p.id_product

LEFT JOIN (
    SELECT
        id_product,
        SUM(quantity)            AS qty_billed,
        COUNT(*)                 AS bill_count,
        SUM(total_product_price) AS total_billed_amount
    FROM bill_product
    GROUP BY id_product
) bp ON bp.id_product = p.id_product

LEFT JOIN (
    SELECT
        product_id,
        SUM(quantity)          AS qty_purchased,
        COUNT(*)               AS purchase_count,
        SUM(total_amount_ttc)  AS total_purchase_amount,
        SUM(total_amount_ttc) / NULLIF(SUM(quantity), 0) AS avg_purchase_price
    FROM purchase
    GROUP BY product_id
) pur ON pur.product_id = p.id_product

WHERE
    s.product_id   IS NOT NULL
    OR bp.id_product IS NOT NULL
    OR pur.product_id IS NOT NULL;

-- Required for CONCURRENTLY refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_product_dashboard_pk ON mv_product_dashboard(id_product);
