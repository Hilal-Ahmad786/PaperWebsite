import os
from PIL import Image

def remove_white_background(input_path):
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        new_data = []
        for item in datas:
            # Change all white (also shades of whites)
            # to transparent
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)

        img.putdata(new_data)
        img.save(input_path, "PNG")
        print(f"Processed {input_path}")
    except Exception as e:
        print(f"Failed to process {input_path}: {e}")

def main():
    directory = 'public/icons/3d'
    if not os.path.exists(directory):
        print(f"Directory {directory} does not exist.")
        return

    for filename in os.listdir(directory):
        if filename.endswith(".png"):
            file_path = os.path.join(directory, filename)
            remove_white_background(file_path)

if __name__ == "__main__":
    main()
