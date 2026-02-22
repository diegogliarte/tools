for f in *.png; do
  ffmpeg -i "$f" -c:v libwebp -quality 75 -compression_level 6 -preset picture -loop 0 -an "${f%.png}.webp"
done