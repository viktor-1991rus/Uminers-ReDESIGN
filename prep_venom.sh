#!/bin/bash

# Простая справка
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Использование: ./prep_venom.sh input_image.jpg output_name"
    echo "Пример: ./prep_venom.sh rtx5090.jpg gpu_venom"
    exit 1
fi

INPUT_FILE="$1"
OUTPUT_NAME="$2"
# Папка, куда сохранять результат (создай её в public/venom-shapes/)
OUTPUT_DIR="./public/venom-shapes"

# Проверяем, существует ли входной файл
if [ ! -f "$INPUT_FILE" ]; then
    echo "Ошибка: Файл $INPUT_FILE не найден."
    exit 1
fi

# Создаем выходную папку, если её нет
mkdir -p "$OUTPUT_DIR"

echo "=== Начало обработки $INPUT_FILE ==="

# ШАГ 1: Удаляем фон (rembg)
# Это создаст временный PNG с вырезанным объектом
echo "[1/3] Удаление фона..."
rembg i "$INPUT_FILE" "${OUTPUT_DIR}/${OUTPUT_NAME}_no_bg.png"

# ШАГ 2: Обработка ImageMagick
# - Convert: берет PNG без фона
# - -colorspace Gray: делает монохромным
# - -negate: инвертирует (если объект темный, делает его светлым на черном, 
#   или наоборот, зависит от ТЗ, для карт плотности часто лучше темный объект на прозрачном)
#   МЫ СДЕЛАЕМ: Темный объект на прозрачном (как в image_6.png)
# - -blur 0x20: сильное размытие (Layer Blur), регулируй 20 для нужного эффекта
echo "[2/3] Конвертация в монохром и размытие..."
magick "${OUTPUT_DIR}/${OUTPUT_NAME}_no_bg.png" \
    -colorspace Gray \
    -blur 0x30 \
    "${OUTPUT_DIR}/${OUTPUT_NAME}.png"

# ШАГ 3: Очистка временных файлов
echo "[3/3] Очистка временных файлов..."
rm "${OUTPUT_DIR}/${OUTPUT_NAME}_no_bg.png"

echo "=== ГОТОВО! Файл сохранен: ${OUTPUT_DIR}/${OUTPUT_NAME}.png ==="
echo "Этот файл готов к загрузке в Vue-компонент VenomParticles."