const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button'); // অনুসন্ধান বোতাম যোগ করা হয়েছে
const resultContainer = document.getElementById('result-container');

// এন্টার চাপলে অর্থ দেখানোর জন্য
searchInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        const searchTerm = searchInput.value;
        if (searchTerm) {
            getMeaning(searchTerm);
        }
    }
});

// অনুসন্ধান বোতামে ক্লিক করলে অর্থ দেখানোর জন্য
searchButton.addEventListener('click', function() {
    const searchTerm = searchInput.value;
    if (searchTerm) {
        getMeaning(searchTerm);
    }
});

async function getMeaning(word) {
    try {
        // প্রথমে ইংরেজি শব্দ কিনা পরীক্ষা করুন
        const englishResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (englishResponse.ok) {
            const data = await englishResponse.json();
            if (data && data.length > 0 && data[0].meanings && data[0].meanings.length > 0) {
                // ইংরেজি শব্দের জন্য অর্থ প্রদর্শন করুন
                let meanings = '';
                let partOfSpeechList = [];
                let synonyms = [];
                let antonyms = [];

                data[0].meanings.forEach(meaning => {
                    meanings += `<p><strong>${meaning.partOfSpeech}:</strong> ${meaning.definitions.map(def => def.definition).join(', ')}</p>`;
                    if (!partOfSpeechList.includes(meaning.partOfSpeech)) {
                        partOfSpeechList.push(meaning.partOfSpeech);
                    }
                    if (meaning.synonyms) {
                        synonyms.push(...meaning.synonyms);
                    }
                    if (meaning.antonyms) {
                        antonyms.push(...meaning.antonyms);
                    }
                });

                const banglaMeaning = await getBanglaMeaning(word);

                resultContainer.innerHTML = `
                    <p><strong>${word}:</strong></p>
                    ${meanings}
                    <p><strong>Parts of Speech:</strong> ${partOfSpeechList.join(', ')}</p>
                    <p><strong>Synonyms:</strong> ${synonyms.join(', ')}</p>
                    <p><strong>Antonyms:</strong> ${antonyms.join(', ')}</p>
                    <p><strong>বাংলা অর্থ:</strong> ${banglaMeaning}</p>
                `;
                return;
            }
        }

        // যদি ইংরেজি শব্দ না হয়, তবে বাংলা শব্দের ইংরেজি অর্থ অনুসন্ধান করুন
        const banglaToEnglish = await getEnglishMeaning(word);
        if (banglaToEnglish) {
            resultContainer.innerHTML = `<p><strong>${word}:</strong> ${banglaToEnglish}</p>`;
        } else {
            resultContainer.innerHTML = `<p>শব্দের অর্থ পাওয়া যায়নি।</p>`;
        }
    } catch (error) {
        console.error('শব্দের অর্থ খুঁজতে ত্রুটি:', error);
        resultContainer.innerHTML = `<p>শব্দের অর্থ খুঁজতে ত্রুটি হয়েছে।</p>`;
    }
}

async function getBanglaMeaning(word) {
    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${word}&langpair=en|bn`);
        const data = await response.json();
        return data.responseData.translatedText;
    } catch (error) {
        console.error('বাংলা অর্থ খুঁজতে ত্রুটি:', error);
        return 'বাংলা অর্থ পাওয়া যায়নি';
    }
}

async function getEnglishMeaning(word) {
    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${word}&langpair=bn|en`);
        const data = await response.json();
        return data.responseData.translatedText;
    } catch (error) {
        console.error('ইংরেজি অর্থ খুঁজতে ত্রুটি:', error);
        return null;
    }
}