from pathlib import Path
import csv


PROJECT_ROOT = Path(__file__).resolve().parents[3]

DATASET_DIR = PROJECT_ROOT / "data" / "demo_dataset"
OUTPUT_PATH = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "demo_dataset_manifest.csv"
)


def get_document_id(folder_name: str) -> str:
    """
    Convert a dataset folder name into the base document ID.

    Examples:
        DOC001              -> DOC001
        DOC002_compressed   -> DOC002
        DOC001_text         -> DOC001
        DOC001_portrait     -> DOC001
        DOC001_copy_paste   -> DOC001
        DOC001_region       -> DOC001
    """

    parts = folder_name.split("_", 1)

    return parts[0]


def get_tampering_type(folder_name: str) -> str:
    """
    Extract tampering type from a tampered folder name.

    Examples:
        DOC001_text          -> text
        DOC001_portrait      -> portrait
        DOC001_copy_paste   -> copy_paste
        DOC001_region       -> region
    """

    parts = folder_name.split("_", 1)

    if len(parts) == 1:
        return "unknown"

    return parts[1]


def build_manifest():
    if not DATASET_DIR.exists():
        raise FileNotFoundError(
            f"Demo dataset not found: {DATASET_DIR}"
        )

    rows = []

    # ==========================================================
    # GENUINE DOCUMENTS
    # ==========================================================

    genuine_dir = DATASET_DIR / "genuine"

    if not genuine_dir.exists():
        raise FileNotFoundError(
            f"Genuine dataset directory not found: {genuine_dir}"
        )

    for document_dir in sorted(genuine_dir.iterdir()):

        if not document_dir.is_dir():
            continue

        image_path = document_dir / "passport.png"

        if not image_path.exists():
            continue

        document_id = get_document_id(document_dir.name)

        rows.append(
            {
                "image_path": str(
                    image_path.relative_to(PROJECT_ROOT)
                ),
                "label": 0,
                "tampering_type": "none",
                "document_id": document_id,
                "split": "train",
            }
        )

    # ==========================================================
    # TAMPERED DOCUMENTS
    # ==========================================================

    tampered_dir = DATASET_DIR / "tampered"

    if not tampered_dir.exists():
        raise FileNotFoundError(
            f"Tampered dataset directory not found: {tampered_dir}"
        )

    for document_dir in sorted(tampered_dir.iterdir()):

        if not document_dir.is_dir():
            continue

        image_path = document_dir / "passport.png"

        if not image_path.exists():
            continue

        document_id = get_document_id(document_dir.name)
        tampering_type = get_tampering_type(document_dir.name)

        rows.append(
            {
                "image_path": str(
                    image_path.relative_to(PROJECT_ROOT)
                ),
                "label": 1,
                "tampering_type": tampering_type,
                "document_id": document_id,
                "split": "train",
            }
        )

    # ==========================================================
    # VALIDATION
    # ==========================================================

    if not rows:
        raise ValueError(
            "No dataset samples were found."
        )

    genuine_count = sum(
        row["label"] == 0
        for row in rows
    )

    tampered_count = sum(
        row["label"] == 1
        for row in rows
    )

    # ==========================================================
    # WRITE MANIFEST
    # ==========================================================

    OUTPUT_PATH.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with OUTPUT_PATH.open(
        "w",
        newline="",
        encoding="utf-8",
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=[
                "image_path",
                "label",
                "tampering_type",
                "document_id",
                "split",
            ],
        )

        writer.writeheader()
        writer.writerows(rows)

    # ==========================================================
    # SUMMARY
    # ==========================================================

    print()
    print("=== DEMO DATASET MANIFEST ===")
    print()
    print(f"Dataset directory : {DATASET_DIR}")
    print(f"Manifest path     : {OUTPUT_PATH}")
    print()
    print(f"Total samples     : {len(rows)}")
    print(f"Genuine samples   : {genuine_count}")
    print(f"Tampered samples  : {tampered_count}")
    print()

    print("Tampering types:")

    tampering_counts = {}

    for row in rows:
        if row["label"] == 1:
            tampering_type = row["tampering_type"]

            tampering_counts[tampering_type] = (
                tampering_counts.get(tampering_type, 0) + 1
            )

    for tampering_type, count in sorted(
        tampering_counts.items()
    ):
        print(f"  {tampering_type}: {count}")

    print()
    print("Manifest creation completed successfully.")


if __name__ == "__main__":
    build_manifest()