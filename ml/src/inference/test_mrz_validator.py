from ml.src.inference.mrz_validator import validate_passport_mrz


line1 = "P<DEMSAMPLE<<ALEX<<<<<<<<<<<<<<<<<<<<<<<<<<"
line2 = "DEM877572DEM8804080M301204<<<<<<<<<<<<<<"


result = validate_passport_mrz(line1, line2)


print("\n=== MRZ VALIDATION ===")
print(f"Valid: {result.valid}")
print(f"Document number: {result.document_number}")
print(f"Date of birth: {result.date_of_birth}")
print(f"Date of expiry: {result.date_of_expiry}")
print(f"Nationality: {result.nationality}")
print(f"Sex: {result.sex}")

print("\nErrors:")

if result.errors:
    for error in result.errors:
        print(f"- {error}")
else:
    print("None")