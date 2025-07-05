# Adjust the method to check if enough words are generated before sampling
def generate_large_wordlist_safe(base_words, target_count):
    combined_words = set()
    for base in base_words:
        for pre, suf in product(prefixes, suffixes):
            word = f"{pre}{base}{suf}".lower().strip()
            if word.isalpha() and len(word) <= 20:
                combined_words.add(word)
    combined_words = list(combined_words)

    # If not enough words generated, just return all
    if len(combined_words) < target_count:
        return combined_words
    else:
        return random.sample(combined_words, target_count)

# Generate and export the final result
final_words_fixed = generate_large_wordlist_safe(extended_base_words, 5000)

# Save to CSV
df_final_fixed = pd.DataFrame(final_words_fixed, columns=["A"])
file_path_final_fixed = "/mnt/data/challenging_wordsearch_5000.csv"
df_final_fixed.to_csv(file_path_final_fixed, index=False)

file_path_final_fixed
