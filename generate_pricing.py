import json
import re

raw_data = """
=== DRY CLEANING - UPPER WEAR ===
Kids regular Wear (Below 10 years) 80
Kids Designer Wear (Below 10 years) 120+
T-Shirt/ Shirt 100
Silk Shirt 120
Safari Suit 120
Blazer 220+
Safari Suit Coat 200
Waist Coat 130
Achkan 300+
Top Plain 100
Top Heavy 130+
Top Very Heavy 200+
Kurta Kameez 120
Kurta Kameez Heavy 180
Kurta Kameez Very Heavy 220+
Dupatta Plain 80
Dupatta Heavy 110
Dupatta Very Heavy 140+
Blouse Plain 50
Blouse Heavy 80
Blouse Very Heavy 120+
Sameez 50
Vest 50
Bra 50
Swimming Costume 50

=== DRY CLEANING - BOTTOM WEAR ===
Pant/ Trousers or Jeans 100
Lungi or Dhoti 120
Track Pant 100
Pajama/ Lower/ Leggings/ Slacks 100
Short/ Capri 80
Jumper 150
Salwar Plain 100
Salwar Heavy 130
Salwar Very Heavy 180+
Palazo Plain 100
Palazo Heavy 130
Palazo Very Heavy 200+
Short Skirt Plain 60
Short Skirt Heavy 100
Short Skirt Very Heavy 150+
Long Skirt Plain 140
Long Skirt Heavy 220
Long Skirt Very Heavy 300+
Petti Coat 70

=== DRY CLEANING - FULL BODY ===
Ladies Suit 1 Pcs 220+
Ladies Suit 2 Pcs 300+
Gents Suit 1 Pcs 250+
Gents Suit 2 Pcs 350+
Safari Suit 1 Pcs 220+
Sherwani 1 Pcs Light 250+
Sherwani 1 Pcs Heavy 300+
Groom Sherwani (Weight upto 2.5Kgs) 800+
Groom Sherwani (Weight upto 5Kgs) 1200+
Groom Sherwani (Weight upto 10Kgs) 1800+
Saree Plain 150+
Saree Heavy 175+
Saree Very Heavy 250+
Bridal Saree (Weight upto 2.5Kgs) 1000+
Bridal Saree (Weight upto 5Kgs) 2000+
Bridal Saree (Weight upto 10Kgs) 3000+
Lehenga 1 Pc Plain 200
Lehenga 1 Pc Heavy 300+
Lehenga 2 Pcs Plain 300
Lehenga 2 Pcs Heavy 450+
Lehenga 3 Pcs Plain 400
Lehenga 3 Pcs Heavy 600+
Bridal Lehenga (Weight upto 2.5Kgs) 1200
Bridal Lehenga (Weight upto 5Kgs) 2000
Bridal Lehenga (Weight upto 10Kgs) 3000
Gown Plain 300
Gown Heavy 400
Gown Bridal 800
Dungaree 150
Sharara 225+

=== DRY CLEANING - WINTER WEAR ===
Woolen Shirt 130
Woolen Pant 140
Sweatshirt without Hood 150
Sweatshirt with Hood 180
Coat - Normal 200
Coat - (Fur Fluffy) 220
Long Coat - Normal 250
Long Coat - (Fur Fluffy) 350
Jacket Half Sleeves 150
Jacket Full Sleeves 200
Jacket with Hood 230
Sweater/ Cardigan Half Sleeves Plain 90
Sweater/ Cardigan Half Sleeves Heavy 130
Sweater/ Cardigan Full Sleeves Plain 150
Sweater/ Cardigan Full Sleeves Heavy 200
Scarf 50

=== DRY CLEANING - HOUSEHOLD ===
Bedsheet - Single 120
Bedsheet - Double 150
Quilt Cover - Single 120
Quilt Cover - Double 160
Bed Spread/ Summer Comforter - Single 250
Bed Spread/ Summer Comforter - Double 350
Sofa/ Cushion/ Pillow Cover - Small 80
Sofa/ Cushion/ Pillow Cover - Medium 100
Sofa/ Cushion/ Pillow Cover - Large 120
Blanket Single - Single Layer 150
Blanket Single - Double Layer 190
Quilt Double - Single Layer 250
Quilt Double - Double Layer 350
Cushion Pillow - Small 120
Cushion Pillow - Medium 160
Cushion Pillow - Large 220
Towel - Large 100
Footmat - small 50
Curtain Belt 40
Hand Towel 30
Tablecloth - Small 70
Tablecloth - Large 100
Table Mat 40
Curtain Door without Liner Panel per sft 8
Curtain Door with Liner Panel per sft 10
Curtain Window without Liner Panel per sft 8
Curtain Window with Liner Panel per sft 10
Blinds per Sq. ft 20
Carpet - Normal Sq. ft 30
Carpet - (Fur/ Puffy) Sq. ft 40+
Soft Toys (Uto 12 inch) 120
Soft Toys (Uto 24 inch) 220+
Soft Toys (Uto 36 inch) 400+
Soft Toys (More than 36 inch) 750+

=== DRY CLEANING - SHOE & BAG CARE ===
Sports Shoe Pair 300
Canvas Shoes Pair 320+
Suede/Sneaker Shoes Pair 350+
Leather Shoes Pair 400+
Ankle Length Boots Pair 500
Mid Length Boots Pair 600
Knee Length Boots Pair 750
Sandel Pair 150
Slippers Pair 120
Bag Pack Small 150
Mountaineers Bag Pack 220
Handbag Canvas Jute/ Cloth small 250
Handbag Canvas Jute/ Cloth Large 350
Leather Handbag Small 400
Leather Handbag Large 800
Trolley Bag (Uto 24 Inches) 200
Trolley Bag (Uto 36 Inches) 350
Trolley Bag (Uto 48 Inches) 500

=== STEAM IRONING - UPPER WEAR ===
Kids (Below 10 Years) 12
Full Shirt 15
Designer wear Shirt 25
T-Shirt/ Half Shirt 15
Silk Shirt 18
Safari Suit 20
Blazer 40
Safari Suit Coat 40
Waist Coat 25
Achkan 80
Top Plain 15
Top Heavy 20
Top Very Heavy 30+
Kurta Kameez 18
Kurta Kameez Heavy 20
Kurta Kameez Very Heavy 30
Dupatta Plain 12
Dupatta Heavy 15
Dupatta Very Heavy 20
Blouse 10
Blouse Heavy 12
Blouse Very Heavy 20

=== STEAM IRONING - BOTTOM WEAR ===
Pant/ Trousers or Jeans 15
Lungi or Dhoti 20
Track Pant 15
Pajama/ Lower/ Leggings/ Slacks 15
Short/ Capri 12
Jumper 15
Salwar Plain 15
Salwar Heavy 20
Salwar Very Heavy 25
Palazzo Plain 15
Palazzo Heavy 20
Short Skirt Plain 15
Short Skirt Heavy 20
Short Skirt Very Heavy 25
Long Skirt Plain 20
Long Skirt Heavy 25
Long Skirt Very Heavy 30
Petti Coat 15

=== STEAM IRONING - STARCH ===
Starched shirt / Pant 20+
Starched saree 50+
Starch + steam iron (shirt / pant etc) 40+
Starch + steam iron (sarees etc) 90+
Starch + Steam iron (Kurti / Kurta) 50
Starch + Steam iron (pyjama) 40
Starch only based on the Item 20+

=== STEAM IRONING - FULL BODY ===
Sherwani 2 Pcs Light 120
Sherwani 2 Pcs Heavy 150
Sherwani 3 Pcs Light 150
Sherwani 3 Pcs Heavy 200
Groom Sherwani (Weight upto 2.5Kgs) 250
Groom Sherwani (Weight upto 5Kgs) 350
Groom Sherwani (Weight upto 10Kgs) 450
Saree Plain 50
Saree Heavy 70
Saree Very Heavy 75+
Bridal Saree (Weight upto 2.5Kgs) 180
Bridal Saree (Weight upto 5Kgs) 250
Bridal Saree (Weight upto 10Kgs) 400
Lehenga 1 Pc Plain 30
Lehenga 1 Pc Heavy 40
Lehenga 3 Pcs Plain 100
Lehenga 3 Pcs Heavy 150
Gown Plain 30
Gown Heavy 50
Gown Bridal 150
Dungaree 25
Long Frock 20
Sharara 40

=== STEAM IRONING - WINTER WEAR ===
Woolen Shirt 20
Sweatshirt without Hood 30
Sweatshirt with Hood 40
Coat Normal 40
Coat (Fur Fluffy) 60
Long Coat Normal 50
Long Coat (Fur Fluffy) 80
Overcoat 100
Jacket Half Sleeves 30
Jacket Full Sleeves 40
Jacket with Hood 50

=== STEAM IRONING - HOUSEHOLD ===
Bedsheet - Single 30
Bedsheet - Double 50
Quilt Cover - Single 30
Quilt Cover - Double 40
Sofa/ Cushion/ Pillow Cover - Small 10
Sofa/ Cushion/ Pillow Cover - Medium 12
Sofa/ Cushion/ Pillow Cover - Large 12
Tablecloth - Small 10
Tablecloth - Large 15
Curtain Door without Liner/ Panel per sft 1.5
Curtain Door with Liner/ Panel per sft 2
Curtain Window without Liner Panel per sft 1.5
Curtain Window with Liner Panel per sft 2
"""

lines = raw_data.strip().split('\n')
json_data = []

current_category = ""
id_counter = 1

for line in lines:
    line = line.strip()
    if not line:
        continue
    if line.startswith('==='):
        current_category = line.replace('===', '').strip()
        continue
        
    # Match item name and price (price is at the end, can be float or string with '+')
    # Use regex to extract everything before the last number as name, and the rest as price
    match = re.match(r'^(.*?)(\d+(?:\.\d+)?\+?)$', line)
    if match:
        name = match.group(1).strip()
        price_str = match.group(2).strip()
        
        # Determine if it's base price (+) or fixed price
        notes = "Base price" if "+" in price_str else ""
        price_num = float(price_str.replace('+', ''))
        
        # Format price if it's a whole number
        if price_num.is_integer():
            price_val = int(price_num)
        else:
            price_val = price_num
            
        json_data.append({
            "id": f"item-{id_counter}",
            "garmentName": name,
            "category": current_category,
            "price": price_val,
            "estimatedTime": "Standard Delivery: 2 Days",
            "notes": notes
        })
        id_counter += 1

with open('src/data/pricing.json', 'w') as f:
    json.dump(json_data, f, indent=2)

print(f"Generated {len(json_data)} items.")
