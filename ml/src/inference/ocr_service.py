from functools import lru_cache
from pathlib import Path

from paddleocr import PaddleOCR

@lru_cache(maxsize=1)
def get_ocr() -> PaddleOCR:
    return PaddleOCR(
        lang="en",
        ocr_version="PP-OCRv5",
        text_detection_model_name="PP-OCRv5_mobile_det",
        text_recognition_model_name="PP-OCRv5_mobile_rec",
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        use_textline_orientation=False,
    )


class PassportOCR:
    def __init__(self):
        self.ocr = get_ocr()

    def extract_text(self, image_path: str) -> list[str]:
        path = Path(image_path)

        if not path.exists():
            raise FileNotFoundError(
                f"Document image not found: {image_path}"
            )

        result = self.ocr.predict(str(path))

        texts = []

        for page in result:
            rec_texts = page.get("rec_texts", [])

            for text in rec_texts:
                cleaned = str(text).strip()

                if cleaned:
                    texts.append(cleaned)

        return texts

    def extract_mrz(self, texts: list[str]) -> list[str]:
        mrz_lines = []

        for text in texts:
            cleaned = text.replace(" ", "").upper()

            if len(cleaned) >= 30 and "<" in cleaned:
                mrz_lines.append(cleaned)

        return mrz_lines


def extract_passport_ocr(image_path: str) -> dict:
    ocr = PassportOCR()

    texts = ocr.extract_text(image_path)
    mrz_lines = ocr.extract_mrz(texts)

    return {
        "texts": texts,
        "mrz_lines": mrz_lines,
    }