#!/bin/bash

# Зберігаєш файл як build_loop_videos.sh
# chmod +x build_loop_videos.sh
# ./build_loop_videos.sh

# Довжина вихідного відео: N секунд
DURATION=3

# Довжина затухання/з'явлення
FADE_DURATION=1

# Вхідні файли
BACKGROUND="background.jpg"
RAW_VIDEO="snow_raw.mp4"

# Вихідні файли
OUTPUT_FILENAME="snow_video"

# Папки
TEMP_DIR="temp"
OUTPUT_DIR="output"

# Обчислення
LOOP_START=$FADE_DURATION
LOOP_END=$((DURATION + 1))
INTRO_SHIFT=$((DURATION - FADE_DURATION))

# Створення папок
mkdir -p "$TEMP_DIR"
mkdir -p "$OUTPUT_DIR"

# Тимчасові файли (всередині temp/)
TRIMMED_VIDEO="$TEMP_DIR/snow_trimmed.mp4"
BLENDED_VIDEO="$TEMP_DIR/snow_blended.mp4"
LOOP_VIDEO="$TEMP_DIR/snow_loop.mp4"

### 1️⃣ Обрізка сирого відео
echo "Обрізаємо сире відео до $DURATION секунд..."
ffmpeg -y -i "$RAW_VIDEO" -t $LOOP_END -c copy "$TRIMMED_VIDEO"

### 2️⃣ Накладення відео снігу на фон-картинку
# echo "Робимо бленд фон + відео..."
# ffmpeg -y -i "$BACKGROUND" -i "$TRIMMED_VIDEO" -filter_complex "
# [1:v] setpts=PTS-STARTPTS, format=gbrp[snow];

# [0:v] scale=1920:1080:force_original_aspect_ratio=increase,
#       crop=1920:1080:(in_w-1920)/2:(in_h-1080)/2,
#       format=gbrp[bg];

# [bg][snow] blend=all_mode=screen:all_opacity=1 [blended];

# [blended] format=yuv420p[out]
# " \
# -map "[out]" -c:v libx264 -crf 18 -preset medium "$BLENDED_VIDEO"

### 3️⃣ Створення плавного LOOP
echo "Готуємо плавний loop..."
ffmpeg -y -i "$BLENDED_VIDEO" -filter_complex "
    [0:v]trim=start=$LOOP_START:end=$LOOP_END,setpts=PTS-STARTPTS,format=yuva420p,
         fade=t=out:st=$INTRO_SHIFT:d=$FADE_DURATION:alpha=1[base];
    [0:v]trim=start=0:end=$FADE_DURATION,setpts=PTS-STARTPTS,format=yuva420p,
         fade=t=in:st=0:d=$FADE_DURATION:alpha=1,
         setpts=PTS+$INTRO_SHIFT/TB[intro];
    [base][intro]overlay=shortest=0:format=auto,format=yuv420p[out]
" -map "[out]" -an "$LOOP_VIDEO"

### 4️⃣ Експорт HQ WEBM
echo "Експорт WEBM VP9..."
ffmpeg -y -i "$LOOP_VIDEO" -c:v libvpx-vp9 -b:v 0 -crf 32 -an "$OUTPUT_DIR/${OUTPUT_FILENAME}.webm"

### 5️⃣ Експорт HQ MP4
echo "Експорт MP4 H.264..."
ffmpeg -y -i "$LOOP_VIDEO" -c:v libx264 -preset slow -crf 22 -movflags +faststart -an "$OUTPUT_DIR/${OUTPUT_FILENAME}.mp4"

### 6️⃣ Мобільні версії
echo "Створення мобільних версій..."

## 720p
ffmpeg -y -i "$LOOP_VIDEO" -vf "scale=-2:720" \
    -c:v libvpx-vp9 -b:v 0 -crf 34 -an "${OUTPUT_DIR}/${OUTPUT_FILENAME}_720.webm"
ffmpeg -y -i "$LOOP_VIDEO" -vf "scale=-2:720" \
    -c:v libx264 -preset slow -crf 24 -an "$OUTPUT_DIR/${OUTPUT_FILENAME}_720.mp4"

## 540p
ffmpeg -y -i "$LOOP_VIDEO" -vf "scale=-2:540" \
    -c:v libvpx-vp9 -b:v 0 -crf 36 -an "$OUTPUT_DIR/${OUTPUT_FILENAME}_540.webm"
ffmpeg -y -i "$LOOP_VIDEO" -vf "scale=-2:540" \
    -c:v libx264 -preset slow -crf 26 -an "$OUTPUT_DIR/${OUTPUT_FILENAME}_540.mp4"

echo "✅ Готово! Фінальні файли у: $OUTPUT_DIR"
echo "ℹ Тимчасові файли у: $TEMP_DIR"
