from pathlib import Path

from paddleocr import PaddleOCR


IMAGE_PATH = (
    Path(__file__).resolve().parents[3]
    / "data"
    / "samples"
    / "genuine"
    / "doc_0001_genuine.png"
)


ocr = PaddleOCR(
    lang="en",
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False,
)


result = ocr.predict(str(IMAGE_PATH))

print("\n=== PaddleOCR RESULT ===\n")

for page in result:
    print(page)