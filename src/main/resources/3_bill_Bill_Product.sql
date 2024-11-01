INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (30, '2024-10-15 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - RBAT'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-15 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - RBAT')),
     (SELECT id_product FROM Product WHERE name = 'VALMAT 5 KG' AND unit_price_sold = 12 AND unit_price_bought = 15 ), 2, 30);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (232.5, '2024-10-05 00:00:00', 'UNPAID', (SELECT customer_id FROM Customer WHERE name = 'INCONNU - ABD RAHMEN (NAJIB)'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-05 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'INCONNU - ABD RAHMEN (NAJIB)')),
     (SELECT id_product FROM Product WHERE name = 'GRAVITA ' AND unit_price_sold = 2.45 AND unit_price_bought = 3.1 ), 75, 232.5);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (30, '2024-09-20 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - RADHWENNE JALLED'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-20 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - RADHWENNE JALLED')),
     (SELECT id_product FROM Product WHERE name = 'VALPRIMER 4 KG' AND unit_price_sold = 28 AND unit_price_bought = 30 ), 1, 30);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (2960, '2024-09-18 00:00:00', 'UNPAID', (SELECT customer_id FROM Customer WHERE name = 'MOEZ KOSKOS'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-18 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'MOEZ KOSKOS')),
     (SELECT id_product FROM Product WHERE name = 'F ENDUIT CHAUX FIN RICCI 20 KG' AND unit_price_sold = 29 AND unit_price_bought = 32 ), 10, 320);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-18 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'MOEZ KOSKOS')),
     (SELECT id_product FROM Product WHERE name = 'M ENDUIT CHAUX MAX 20 KG' AND unit_price_sold = 29 AND unit_price_bought = 32 ), 20, 640);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-18 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'MOEZ KOSKOS')),
     (SELECT id_product FROM Product WHERE name = 'BAGUETTE MURAL' AND unit_price_sold = 8.6 AND unit_price_bought = 10 ), 200, 2000);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (120, '2024-09-11 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'INCONNU - TAREK LAAMOURI'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-11 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'INCONNU - TAREK LAAMOURI')),
     (SELECT id_product FROM Product WHERE name = 'M ENDUIT CHAUX MAX 20 KG' AND unit_price_sold = 29 AND unit_price_bought = 40 ), 2, 80);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-11 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'INCONNU - TAREK LAAMOURI')),
     (SELECT id_product FROM Product WHERE name = 'F ENDUIT CHAUX FIN RICCI 20 KG' AND unit_price_sold = 29 AND unit_price_bought = 40 ), 1, 40);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (490, '2024-09-18 00:00:00', 'UNPAID', (SELECT customer_id FROM Customer WHERE name = 'FAROUK ROUISSI - QUINCAILLERIE'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-18 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'FAROUK ROUISSI - QUINCAILLERIE')),
     (SELECT id_product FROM Product WHERE name = 'VALBLANC 23 KG' AND unit_price_sold = 65 AND unit_price_bought = 70 ), 7, 490);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (600, '2024-08-07 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'BALLOUMI'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-08-07 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BALLOUMI')),
     (SELECT id_product FROM Product WHERE name = 'STICO 1000' AND unit_price_sold = 114.25 AND unit_price_bought = 150 ), 4, 600);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (705, '2024-09-11 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'INCONNU - RABTI SOFIENNE'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-11 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'INCONNU - RABTI SOFIENNE')),
     (SELECT id_product FROM Product WHERE name = 'RACH 25 KG' AND unit_price_sold = 22 AND unit_price_bought = 26 ), 5, 130);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-11 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'INCONNU - RABTI SOFIENNE')),
     (SELECT id_product FROM Product WHERE name = 'VALBLANC 40 KG' AND unit_price_sold = 110 AND unit_price_bought = 130 ), 2, 260);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-11 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'INCONNU - RABTI SOFIENNE')),
     (SELECT id_product FROM Product WHERE name = 'VALIDRO SATINE 15 KG' AND unit_price_sold = 237 AND unit_price_bought = 270 ), 1, 270);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-11 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'INCONNU - RABTI SOFIENNE')),
     (SELECT id_product FROM Product WHERE name = 'F ENDUIT CHAUX FIN 17 KG' AND unit_price_sold = 29 AND unit_price_bought = 45 ), 1, 45);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (1605, '2024-09-02 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'MOEZ KOSKOS - CHANTIER M9'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-02 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'MOEZ KOSKOS - CHANTIER M9')),
     (SELECT id_product FROM Product WHERE name = 'VALBLANC 40 KG' AND unit_price_sold = 110 AND unit_price_bought = 125 ), 8, 1000);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-02 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'MOEZ KOSKOS - CHANTIER M9')),
     (SELECT id_product FROM Product WHERE name = 'VALPRIMER 18 KG' AND unit_price_sold = 110 AND unit_price_bought = 120 ), 4, 480);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-02 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'MOEZ KOSKOS - CHANTIER M9')),
     (SELECT id_product FROM Product WHERE name = 'BAGUETTE MURAL' AND unit_price_sold = 9 AND unit_price_bought = 12.5 ), 10, 125);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (400, '2024-08-26 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-08-26 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA')),
     (SELECT id_product FROM Product WHERE name = 'F ENDUIT CHAUX FIN 17 KG' AND unit_price_sold = 29 AND unit_price_bought = 40 ), 7, 280);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-08-26 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA')),
     (SELECT id_product FROM Product WHERE name = 'G ENDUIT CHAUX GROS 20 KG' AND unit_price_sold = 32.5 AND unit_price_bought = 40 ), 2, 80);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-08-26 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA')),
     (SELECT id_product FROM Product WHERE name = 'F ENDUIT CHAUX FIN 17 KG' AND unit_price_sold = 29 AND unit_price_bought = 40 ), 1, 40);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (240, '2024-09-24 00:00:00', 'UNPAID', (SELECT customer_id FROM Customer WHERE name = 'MOEZ KOSKOS'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-24 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'MOEZ KOSKOS')),
     (SELECT id_product FROM Product WHERE name = 'VALPRIMER 18 KG' AND unit_price_sold = 110 AND unit_price_bought = 120 ), 2, 240);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (80, '2024-09-21 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - RADHWENNE JALLED'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-21 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - RADHWENNE JALLED')),
     (SELECT id_product FROM Product WHERE name = 'F ENDUIT CHAUX FIN 17 KG' AND unit_price_sold = 29 AND unit_price_bought = 40 ), 2, 80);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (35, '2024-09-20 00:00:00', 'UNPAID', (SELECT customer_id FROM Customer WHERE name = 'ADEL DAHMANI'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-20 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'ADEL DAHMANI')),
     (SELECT id_product FROM Product WHERE name = 'F ENDUIT CHAUX FIN 17 KG' AND unit_price_sold = 29 AND unit_price_bought = 35 ), 1, 35);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (390, '2024-09-23 00:00:00', 'PARTIALLY_PAID', (SELECT customer_id FROM Customer WHERE name = 'INCONNU - ABD RAHMEN (NAJIB)'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-23 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'INCONNU - ABD RAHMEN (NAJIB)')),
     (SELECT id_product FROM Product WHERE name = 'RACH 25 KG' AND unit_price_sold = 21.5 AND unit_price_bought = 26 ), 15, 390);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (90, '2024-09-18 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'INCONNU - RABTI SOFIENNE'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-18 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'INCONNU - RABTI SOFIENNE')),
     (SELECT id_product FROM Product WHERE name = 'F ENDUIT CHAUX FIN 17 KG' AND unit_price_sold = 29 AND unit_price_bought = 45 ), 2, 90);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (80, '2024-08-17 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'NAJET ARBI'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-08-17 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'NAJET ARBI')),
     (SELECT id_product FROM Product WHERE name = 'G ENDUIT CHAUX GROS 20 KG' AND unit_price_sold = 32.5 AND unit_price_bought = 40 ), 1, 40);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-08-17 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'NAJET ARBI')),
     (SELECT id_product FROM Product WHERE name = 'F ENDUIT CHAUX FIN 17 KG' AND unit_price_sold = 29 AND unit_price_bought = 40 ), 1, 40);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (70, '2024-10-07 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'HABLANI'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-07 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'HABLANI')),
     (SELECT id_product FROM Product WHERE name = 'TALOCHE' AND unit_price_sold = 60 AND unit_price_bought = 70 ), 1, 70);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (110, '2024-09-12 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'INCONNU - TAREK LAAMOURI'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-12 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'INCONNU - TAREK LAAMOURI')),
     (SELECT id_product FROM Product WHERE name = 'VALPRIMER 4 KG' AND unit_price_sold = 28 AND unit_price_bought = 30 ), 1, 30);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-12 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'INCONNU - TAREK LAAMOURI')),
     (SELECT id_product FROM Product WHERE name = 'VALBLANC 23 KG' AND unit_price_sold = 65 AND unit_price_bought = 80 ), 1, 80);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (662.5, '2024-09-02 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'HABLANI'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-02 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'HABLANI')),
     (SELECT id_product FROM Product WHERE name = 'GRAVITA 578' AND unit_price_sold = 2.4 AND unit_price_bought = 2.65 ), 250, 662.5);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (42, '2024-10-05 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'AYMEN HZAMI'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-05 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'AYMEN HZAMI')),
     (SELECT id_product FROM Product WHERE name = 'VALBLANC 5 KG' AND unit_price_sold = 17.5 AND unit_price_bought = 21 ), 2, 42);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (1292, '2024-09-24 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'HZAMI - INCONNU'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-24 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'HZAMI - INCONNU')),
     (SELECT id_product FROM Product WHERE name = 'F ENDUIT CHAUX FIN 17 KG' AND unit_price_sold = 29 AND unit_price_bought = 40 ), 6, 240);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-24 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'HZAMI - INCONNU')),
     (SELECT id_product FROM Product WHERE name = 'STUCOO 1000 456 D 12 L' AND unit_price_sold = 350 AND unit_price_bought = 450 ), 2, 900);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-24 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'HZAMI - INCONNU')),
     (SELECT id_product FROM Product WHERE name = 'CIRA 370 0.7 L' AND unit_price_sold = 50 AND unit_price_bought = 76 ), 2, 152);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (650, '2024-09-04 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'INCONNU - ABD RAHMEN (NAJIB)'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-04 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'INCONNU - ABD RAHMEN (NAJIB)')),
     (SELECT id_product FROM Product WHERE name = 'VALPRIMER 18 KG' AND unit_price_sold = 110 AND unit_price_bought = 130 ), 2, 260);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-04 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'INCONNU - ABD RAHMEN (NAJIB)')),
     (SELECT id_product FROM Product WHERE name = 'ENDUIT RACH' AND unit_price_sold = 21.5 AND unit_price_bought = 26 ), 15, 390);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (125, '2024-08-20 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'HABLANI'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-08-20 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'HABLANI')),
     (SELECT id_product FROM Product WHERE name = 'VALPRIMER BIANCO 18 KG' AND unit_price_sold = 115 AND unit_price_bought = 125 ), 1, 125);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (72, '2024-09-25 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'HZAMI - INCONNU'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-25 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'HZAMI - INCONNU')),
     (SELECT id_product FROM Product WHERE name = 'VALBLANC 23 KG' AND unit_price_sold = 65 AND unit_price_bought = 72 ), 1, 72);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (290, '2024-09-04 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'BALLOUMI'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-04 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BALLOUMI')),
     (SELECT id_product FROM Product WHERE name = 'ADDITIVO GOLD 0.25 L' AND unit_price_sold = 51.17 AND unit_price_bought = 60 ), 1, 60);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-04 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BALLOUMI')),
     (SELECT id_product FROM Product WHERE name = 'KLONDIKE LIGHT 1 L' AND unit_price_sold = 54.5 AND unit_price_bought = 65 ), 1, 65);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-04 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BALLOUMI')),
     (SELECT id_product FROM Product WHERE name = 'KLONDIKE LIGHT 2.5 L' AND unit_price_sold = 112 AND unit_price_bought = 135 ), 1, 135);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-04 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BALLOUMI')),
     (SELECT id_product FROM Product WHERE name = 'ADDITIVO GOLD 0.1 L' AND unit_price_sold = 25 AND unit_price_bought = 30 ), 1, 30);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (80, '2024-08-17 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'HABLANI'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-08-17 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'HABLANI')),
     (SELECT id_product FROM Product WHERE name = 'G ENDUIT CHAUX GROS 20 KG' AND unit_price_sold = 32.5 AND unit_price_bought = 40 ), 1, 40);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-08-17 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'HABLANI')),
     (SELECT id_product FROM Product WHERE name = 'F ENDUIT CHAUX FIN 17 KG' AND unit_price_sold = 29 AND unit_price_bought = 40 ), 1, 40);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (40, '2024-09-23 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - RADHWENNE JALLED'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-23 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - RADHWENNE JALLED')),
     (SELECT id_product FROM Product WHERE name = 'F ENDUIT CHAUX FIN 17 KG' AND unit_price_sold = 29 AND unit_price_bought = 40 ), 1, 40);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (650, '2024-09-11 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'INCONNU - ABD RAHMEN (NAJIB)'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-11 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'INCONNU - ABD RAHMEN (NAJIB)')),
     (SELECT id_product FROM Product WHERE name = 'RACH 25 KG' AND unit_price_sold = 22 AND unit_price_bought = 26 ), 25, 650);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (110, '2024-09-24 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - RADHWENNE JALLED'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-24 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - RADHWENNE JALLED')),
     (SELECT id_product FROM Product WHERE name = 'VALBLANC 23 KG' AND unit_price_sold = 65 AND unit_price_bought = 70 ), 1, 70);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-24 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - RADHWENNE JALLED')),
     (SELECT id_product FROM Product WHERE name = 'F ENDUIT CHAUX FIN 17 KG' AND unit_price_sold = 29 AND unit_price_bought = 40 ), 1, 40);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (50, '2024-09-02 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'BALLOUMI'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-02 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BALLOUMI')),
     (SELECT id_product FROM Product WHERE name = 'RASAFINE 20 KG' AND unit_price_sold = 45 AND unit_price_bought = 50 ), 1, 50);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (730, '2024-08-14 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - MONJIA SWISRA'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-08-14 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - MONJIA SWISRA')),
     (SELECT id_product FROM Product WHERE name = 'VALBLANC 23 KG' AND unit_price_sold = 68 AND unit_price_bought = 73 ), 10, 730);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (40, '2024-10-16 00:00:00', 'UNPAID', (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - RBAT'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-16 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - RBAT')),
     (SELECT id_product FROM Product WHERE name = 'TRANSPIRANTE 209 4KG' AND unit_price_sold = 30 AND unit_price_bought = 40 ), 1, 40);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (396, '2024-10-05 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'HABLANI - M BIRSOU'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-05 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'HABLANI - M BIRSOU')),
     (SELECT id_product FROM Product WHERE name = 'STICOO 1000 4L ' AND unit_price_sold = 120 AND unit_price_bought = 180 ), 1, 180);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-05 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'HABLANI - M BIRSOU')),
     (SELECT id_product FROM Product WHERE name = 'RACH 25 KG' AND unit_price_sold = 22 AND unit_price_bought = 27 ), 8, 216);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (840, '2024-08-02 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-08-02 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA')),
     (SELECT id_product FROM Product WHERE name = 'VALETANCHE 18 KG' AND unit_price_sold = 115 AND unit_price_bought = 140 ), 6, 840);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (155, '2024-09-27 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - SOLIMAR'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-27 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - SOLIMAR')),
     (SELECT id_product FROM Product WHERE name = 'VALPRIMER 4 KG' AND unit_price_sold = 28 AND unit_price_bought = 35 ), 1, 35);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-27 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - SOLIMAR')),
     (SELECT id_product FROM Product WHERE name = 'F ENDUIT CHAUX FIN 17 KG' AND unit_price_sold = 29 AND unit_price_bought = 40 ), 3, 120);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (64, '2024-09-24 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'AYMEN HZAMI - INCONNU'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-24 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'AYMEN HZAMI - INCONNU')),
     (SELECT id_product FROM Product WHERE name = 'VALPRIMER 4 KG' AND unit_price_sold = 28 AND unit_price_bought = 32 ), 2, 64);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (720, '2024-09-28 00:00:00', 'UNPAID', (SELECT customer_id FROM Customer WHERE name = 'MOEZ KOSKOS'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-28 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'MOEZ KOSKOS')),
     (SELECT id_product FROM Product WHERE name = 'V55 BASE BLANCHE 15 KG' AND unit_price_sold = 160 AND unit_price_bought = 190 ), 3, 570);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-28 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'MOEZ KOSKOS')),
     (SELECT id_product FROM Product WHERE name = 'ADDITIVO SANIFICANTE VH 2020 0.4 L' AND unit_price_sold = 121 AND unit_price_bought = 150 ), 1, 150);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (80, '2024-08-23 00:00:00', 'UNPAID', (SELECT customer_id FROM Customer WHERE name = 'AYMEN wajdi'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-08-23 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'AYMEN wajdi')),
     (SELECT id_product FROM Product WHERE name = 'VALBLANC 23 KG' AND unit_price_sold = 65 AND unit_price_bought = 80 ), 1, 80);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (100, '2024-08-11 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'MOEZ KOSKOS'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-08-11 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'MOEZ KOSKOS')),
     (SELECT id_product FROM Product WHERE name = 'AQUA METAL ORO 0.5L' AND unit_price_sold = 83 AND unit_price_bought = 100 ), 1, 100);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (155, '2024-10-04 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'AYMEN HZAMI - NAYFER'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-04 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'AYMEN HZAMI - NAYFER')),
     (SELECT id_product FROM Product WHERE name = 'VALPRIMER 4 KG' AND unit_price_sold = 28 AND unit_price_bought = 35 ), 1, 35);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-04 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'AYMEN HZAMI - NAYFER')),
     (SELECT id_product FROM Product WHERE name = 'F ENDUIT CHAUX FIN 17 KG' AND unit_price_sold = 29 AND unit_price_bought = 40 ), 3, 120);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (980, '2024-09-06 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - MONJIA SWISRA'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-06 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - MONJIA SWISRA')),
     (SELECT id_product FROM Product WHERE name = 'FILLET FIBRE DE VERRE' AND unit_price_sold = 120 AND unit_price_bought = 160 ), 2, 320);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-06 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - MONJIA SWISRA')),
     (SELECT id_product FROM Product WHERE name = 'VALPRIMER 18 KG' AND unit_price_sold = 110 AND unit_price_bought = 130 ), 2, 260);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-06 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - MONJIA SWISRA')),
     (SELECT id_product FROM Product WHERE name = 'F ENDUIT CHAUX FIN 17 KG' AND unit_price_sold = 29 AND unit_price_bought = 40 ), 10, 400);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (340, '2024-10-05 00:00:00', 'UNPAID', (SELECT customer_id FROM Customer WHERE name = 'FAROUK ROUISSI - QUINCAILLERIE'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-05 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'FAROUK ROUISSI - QUINCAILLERIE')),
     (SELECT id_product FROM Product WHERE name = 'VALETANCHE' AND unit_price_sold = 110 AND unit_price_bought = 130 ), 1, 130);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-05 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'FAROUK ROUISSI - QUINCAILLERIE')),
     (SELECT id_product FROM Product WHERE name = 'CHAUX ETANCHE 20 KG' AND unit_price_sold = 38 AND unit_price_bought = 42 ), 5, 210);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (210, '2024-09-21 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'ADEL DAHMANI - SABIHA ELHIF'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-21 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'ADEL DAHMANI - SABIHA ELHIF')),
     (SELECT id_product FROM Product WHERE name = 'VALBLANC 23 KG' AND unit_price_sold = 65 AND unit_price_bought = 70 ), 3, 210);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (450, '2024-08-12 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'SCOLIO - QUINCAILLERIE'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-08-12 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'SCOLIO - QUINCAILLERIE')),
     (SELECT id_product FROM Product WHERE name = 'STICO 1000' AND unit_price_sold = 114.25 AND unit_price_bought = 150 ), 3, 450);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (35, '2024-10-23 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'XXX - NAJET ARBI'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-23 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'XXX - NAJET ARBI')),
     (SELECT id_product FROM Product WHERE name = 'VALPRIMER 4 KG' AND unit_price_sold = 28 AND unit_price_bought = 35 ), 1, 35);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (520, '2024-08-06 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'NAJIB MANZEL'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-08-06 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'NAJIB MANZEL')),
     (SELECT id_product FROM Product WHERE name = 'STICO 1000' AND unit_price_sold = 114.25 AND unit_price_bought = 150 ), 1, 150);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-08-06 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'NAJIB MANZEL')),
     (SELECT id_product FROM Product WHERE name = 'STICO 1000 12KG' AND unit_price_sold = 313 AND unit_price_bought = 370 ), 1, 370);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (190, '2024-10-10 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - RBAT'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-10 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - RBAT')),
     (SELECT id_product FROM Product WHERE name = 'TRANSPIRANTE 209 15KG' AND unit_price_sold = 80 AND unit_price_bought = 95 ), 1, 95);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-10 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - RBAT')),
     (SELECT id_product FROM Product WHERE name = 'VALENDUIT 5 KG' AND unit_price_sold = 12.5 AND unit_price_bought = 15 ), 1, 15);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-10 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - RBAT')),
     (SELECT id_product FROM Product WHERE name = 'SABULADOR 608 TEINTE M 1L' AND unit_price_sold = 71.4 AND unit_price_bought = 80 ), 1, 80);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (1350, '2024-09-02 00:00:00', 'UNPAID', (SELECT customer_id FROM Customer WHERE name = 'FAROUK ROUISSI - QUINCAILLERIE'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-02 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'FAROUK ROUISSI - QUINCAILLERIE')),
     (SELECT id_product FROM Product WHERE name = 'VALMAT 40 KG' AND unit_price_sold = 60 AND unit_price_bought = 65 ), 10, 650);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-02 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'FAROUK ROUISSI - QUINCAILLERIE')),
     (SELECT id_product FROM Product WHERE name = 'VALBLANC 23 KG' AND unit_price_sold = 65 AND unit_price_bought = 70 ), 10, 700);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (1375, '2024-08-14 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-08-14 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA')),
     (SELECT id_product FROM Product WHERE name = 'G ENDUIT CHAUX GROS 20 KG' AND unit_price_sold = 32.5 AND unit_price_bought = 40 ), 17, 680);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-08-14 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA')),
     (SELECT id_product FROM Product WHERE name = 'VALPRIMER 18 KG' AND unit_price_sold = 115 AND unit_price_bought = 125 ), 3, 375);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-08-14 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA')),
     (SELECT id_product FROM Product WHERE name = 'F ENDUIT CHAUX FIN 17 KG' AND unit_price_sold = 29 AND unit_price_bought = 40 ), 8, 320);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (100, '2024-09-20 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'TAREK ASTRAL - QUINCAILLERIE'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-20 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'TAREK ASTRAL - QUINCAILLERIE')),
     (SELECT id_product FROM Product WHERE name = 'BAGUETTE MURAL' AND unit_price_sold = 9 AND unit_price_bought = 10 ), 10, 100);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (565, '2024-10-11 00:00:00', 'PARTIALLY_PAID', (SELECT customer_id FROM Customer WHERE name = 'HABLANI - M BIRSOU'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-11 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'HABLANI - M BIRSOU')),
     (SELECT id_product FROM Product WHERE name = 'CIRE 1L' AND unit_price_sold = 50 AND unit_price_bought = 76 ), 1, 76);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-11 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'HABLANI - M BIRSOU')),
     (SELECT id_product FROM Product WHERE name = 'COLLE 100G ' AND unit_price_sold = 6 AND unit_price_bought = 10 ), 1, 10);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-11 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'HABLANI - M BIRSOU')),
     (SELECT id_product FROM Product WHERE name = 'MARMORINO ANTICO/RUSTICO 4 L' AND unit_price_sold = 60 AND unit_price_bought = 90 ), 2, 180);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-11 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'HABLANI - M BIRSOU')),
     (SELECT id_product FROM Product WHERE name = 'VALSETIN 510 1 L' AND unit_price_sold = 72 AND unit_price_bought = 110 ), 2, 220);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-11 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'HABLANI - M BIRSOU')),
     (SELECT id_product FROM Product WHERE name = 'ART.216' AND unit_price_sold = 67 AND unit_price_bought = 79 ), 1, 79);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (150, '2024-10-11 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'STE CHAMAKHI - QUINCAILLERIE'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-11 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'STE CHAMAKHI - QUINCAILLERIE')),
     (SELECT id_product FROM Product WHERE name = 'FILLET FIBRE DE VERRE' AND unit_price_sold = 120 AND unit_price_bought = 150 ), 1, 150);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (640, '2024-09-06 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'HABLANI - M BIRSOU'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-06 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'HABLANI - M BIRSOU')),
     (SELECT id_product FROM Product WHERE name = 'RASAFINE 25 KG' AND unit_price_sold = 46 AND unit_price_bought = 58.5 ), 4, 234);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-06 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'HABLANI - M BIRSOU')),
     (SELECT id_product FROM Product WHERE name = 'VALENDUIT 20KG' AND unit_price_sold = 45 AND unit_price_bought = 55 ), 1, 55);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-06 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'HABLANI - M BIRSOU')),
     (SELECT id_product FROM Product WHERE name = 'VALIDRO SATINE 4 KG' AND unit_price_sold = 64 AND unit_price_bought = 84 ), 2, 168);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-06 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'HABLANI - M BIRSOU')),
     (SELECT id_product FROM Product WHERE name = 'VALPRIMER 18 KG' AND unit_price_sold = 110 AND unit_price_bought = 143 ), 1, 143);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-06 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'HABLANI - M BIRSOU')),
     (SELECT id_product FROM Product WHERE name = 'F ENDUIT CHAUX FIN 17 KG' AND unit_price_sold = 29 AND unit_price_bought = 40 ), 1, 40);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (857.5, '2024-08-20 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-08-20 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA')),
     (SELECT id_product FROM Product WHERE name = 'F ENDUIT CHAUX FIN 17 KG' AND unit_price_sold = 29 AND unit_price_bought = 40 ), 3, 120);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-08-20 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA')),
     (SELECT id_product FROM Product WHERE name = 'G ENDUIT CHAUX GROS 20 KG' AND unit_price_sold = 32.5 AND unit_price_bought = 40 ), 10, 400);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-08-20 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA')),
     (SELECT id_product FROM Product WHERE name = 'VALENDUIT 20KG' AND unit_price_sold = 44 AND unit_price_bought = 50 ), 3, 150);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-08-20 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA')),
     (SELECT id_product FROM Product WHERE name = 'BAGUETTE MURAL' AND unit_price_sold = 9 AND unit_price_bought = 12.5 ), 15, 187.5);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (40, '2024-10-17 00:00:00', 'UNPAID', (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - RBAT'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-17 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - RBAT')),
     (SELECT id_product FROM Product WHERE name = 'TRANSPIRANTE 209 4KG' AND unit_price_sold = 30 AND unit_price_bought = 40 ), 1, 40);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (1100, '2024-10-17 00:00:00', 'UNPAID', (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - MONJIA SWISRA'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-17 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - MONJIA SWISRA')),
     (SELECT id_product FROM Product WHERE name = 'VALTEX 40KG' AND unit_price_sold = 80 AND unit_price_bought = 110 ), 10, 1100);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (200, '2024-10-07 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'AYMEN HZAMI'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-07 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'AYMEN HZAMI')),
     (SELECT id_product FROM Product WHERE name = 'TALOCHE' AND unit_price_sold = 90 AND unit_price_bought = 100 ), 2, 200);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (160, '2024-09-18 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - MONJIA SWISRA'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-18 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - MONJIA SWISRA')),
     (SELECT id_product FROM Product WHERE name = 'FILLET FIBRE DE VERRE' AND unit_price_sold = 120 AND unit_price_bought = 160 ), 1, 160);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (140, '2024-10-23 00:00:00', 'UNPAID', (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - HAMMADI SOUISSI'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-10-23 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - HAMMADI SOUISSI')),
     (SELECT id_product FROM Product WHERE name = 'VALETANCHE 18 KG' AND unit_price_sold = 115 AND unit_price_bought = 140 ), 1, 140);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (188, '2024-09-24 00:00:00', 'PAID', (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - HSOUMI'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-24 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - HSOUMI')),
     (SELECT id_product FROM Product WHERE name = 'VALBLANC 23 KG' AND unit_price_sold = 65 AND unit_price_bought = 73 ), 1, 73);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-24 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - HSOUMI')),
     (SELECT id_product FROM Product WHERE name = 'VALPRIMER 4 KG' AND unit_price_sold = 28 AND unit_price_bought = 35 ), 1, 35);

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-24 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'BOUSRIA - HSOUMI')),
     (SELECT id_product FROM Product WHERE name = 'F ENDUIT CHAUX FIN 17 KG' AND unit_price_sold = 29 AND unit_price_bought = 40 ), 2, 80);

INSERT INTO Bill (total, date_bill, payment_status, customer_id)
VALUES
    (70, '2024-09-12 00:00:00', 'UNPAID', (SELECT customer_id FROM Customer WHERE name = 'INCONNU - ANIS BEN HASSINE'));

INSERT INTO Bill_Product (id_bill, id_product, quantity, total_product_price)
VALUES
    ((SELECT max(id_bill) FROM Bill WHERE date_bill = '2024-09-12 00:00:00'
                                 AND customer_id = (SELECT customer_id FROM Customer WHERE name = 'INCONNU - ANIS BEN HASSINE')),
     (SELECT id_product FROM Product WHERE name = 'VALBLANC 23 KG' AND unit_price_sold = 65 AND unit_price_bought = 70 ), 1, 70);

