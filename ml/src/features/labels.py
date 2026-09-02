from enum import IntEnum


class DocumentLabel(IntEnum):
    GENUINE = 0
    TAMPERED = 1


TAMPERING_TYPES = {
    "none",
    "text_modification",
    "portrait_substitution",
    "copy_paste",
    "region_manipulation",
    "mixed",
}