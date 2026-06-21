-- Remove sale records that were automatically created by BillService alongside bill_product entries.
-- Sales originating from bills are now tracked exclusively via bill_product.
DELETE FROM sale
WHERE comment = 'Vente automatique via facturation';
