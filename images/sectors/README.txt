Put the 12 sector tile pictures (PNG) in this folder, using these exact file names:

  Education.png
  Health and Nutrition.png
  Social Welfare and Protection.png
  Transportation.png
  Infrastructure.png
  Environment.png
  Tourism.png
  Food and Agriculture.png
  Labor and Employment.png
  Security, Justice and Peace.png
  Arts, Culture, and Sports.png
  Energy.png

The site looks for each picture in images/sectors/ first and then in images/ (where the old
site kept them), so pictures that are already in images/ are picked up automatically.
Until a picture is found, that sector shows a simple text tile; as soon as the file exists,
the picture replaces the text tile (no code change). The file names are listed in
data/entries-2025.js (the "art" lines) if you ever want to rename them.
Tip: shrink the pictures first (about 400 pixels wide is plenty) so the page stays fast.