
        // --- 0. GEMINI API SETUP ---
        const apiKey = ""; // API key is injected by the environment

        async function fetchGeminiAPI(payload) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
            const delays = [1000, 2000, 4000, 8000, 16000];
            
            for (let i = 0; i < 5; i++) {
                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    return await response.json();
                } catch (error) {
                    if (i === 4) throw error;
                    await new Promise(r => setTimeout(r, delays[i]));
                }
            }
        }

        // --- 1. DATA & LOCAL STORAGE ---
        const defaultPlaceholderBanner = "https://images.unsplash.com/photo-1495195134817-a1a280040141?auto=format&fit=crop&q=80&w=1000";
        const defaultPlaceholderProfile = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200";
        const inputClass = "w-full h-12 bg-white border border-sage border-opacity-30 rounded-sm focus:border-gold outline-none px-4 text-forest font-semibold text-sm shadow-sm transition-all";
        const textareaClass = "w-full min-h-[120px] bg-white border border-sage border-opacity-30 rounded-sm focus:border-gold outline-none p-4 text-forest font-semibold text-sm shadow-sm transition-all resize-y";

        let userSettings = {
            name: "",
            country: "",
            bio: "",
            isPublic: false,
            profilePic: null,
            bannerPic: null,
            email: "",
            measurementSystem: "Metric", 
            language: "en",
            indexViewMode: "cards",
            notebookCover: getDefaultNotebookCover(),
            showNotebookStickyNotes: true,
            simpleMode: false,
            premium: false,
            simpleMode: false,
            favorites: [],
            myRecipeRatings: {}
        };

        let recipes = [];
        let userFamilies = [];
        let currentScale = 1;
        let isCookingMode = false;
        let searchQuery = "";
        let showListSearch = false;
        let showListFilters = false;
        let browseQuery = "";
        let indexViewMode = "cards";
        let notebookPageIndex = 0;
        let notebookCoverOpen = false;
        let draftNotebookCover = null;
        let activeNotebookStickyNoteMenu = null;
        let currentIndexRecipeIds = [];
        let categoryFilter = "";
        let difficultyFilter = "";
        let dietFilter = [];
        let showDietFilters = false;
        let showDietGuide = false;
        let cuisineFilter = "";
        let collectionScopeFilter = "all";
        let showFavoritesOnly = false;
        let draftIngredients = [];
        let draftSteps = [];
        let draftProfile = null; 
        let editingRecipeId = null;
        let recipeSubmitAction = 'save';
        let hasLoadedPublishedRecipesCache = false;
        let isLoadingPublishedRecipesCache = false;
        let activeSavedRecipeUpdateNoticeId = null;
        let publishedRecipeStatusChecks = {};

        const countriesList = [
            "ðŸ‡¦ðŸ‡· Argentina", "ðŸ‡¦ðŸ‡º Australia", "ðŸ‡¦ðŸ‡¹ Austria", "ðŸ‡§ðŸ‡ª Belgium", "ðŸ‡§ðŸ‡· Brazil", "ðŸ‡¨ðŸ‡¦ Canada", 
            "ðŸ‡¨ðŸ‡± Chile", "ðŸ‡¨ðŸ‡³ China", "ðŸ‡¨ðŸ‡´ Colombia", "ðŸ‡­ðŸ‡· Croatia", "ðŸ‡¨ðŸ‡º Cuba", "ðŸ‡¨ðŸ‡¿ Czechia", 
            "ðŸ‡©ðŸ‡° Denmark", "ðŸ‡ªðŸ‡¬ Egypt", "ðŸ‡ªðŸ‡¹ Ethiopia", "ðŸ‡«ðŸ‡® Finland", "ðŸ‡«ðŸ‡· France", "ðŸ‡©ðŸ‡ª Germany", 
            "ðŸ‡¬ðŸ‡· Greece", "ðŸ‡­ðŸ‡º Hungary", "ðŸ‡®ðŸ‡³ India", "ðŸ‡®ðŸ‡© Indonesia", "ðŸ‡®ðŸ‡· Iran", "ðŸ‡®ðŸ‡ª Ireland", 
            "ðŸ‡®ðŸ‡± Israel", "ðŸ‡®ðŸ‡¹ Italy", "ðŸ‡¯ðŸ‡² Jamaica", "ðŸ‡¯ðŸ‡µ Japan", "ðŸ‡°ðŸ‡ª Kenya", "ðŸ‡±ðŸ‡§ Lebanon", 
            "ðŸ‡²ðŸ‡¾ Malaysia", "ðŸ‡²ðŸ‡½ Mexico", "ðŸ‡²ðŸ‡¦ Morocco", "ðŸ‡³ðŸ‡± Netherlands", "ðŸ‡³ðŸ‡¿ New Zealand", 
            "ðŸ‡³ðŸ‡¬ Nigeria", "ðŸ‡³ðŸ‡´ Norway", "ðŸ‡µðŸ‡° Pakistan", "ðŸ‡µðŸ‡ª Peru", "ðŸ‡µðŸ‡­ Philippines", "ðŸ‡µðŸ‡± Poland", 
            "ðŸ‡µðŸ‡¹ Portugal", "ðŸ‡·ðŸ‡´ Romania", "ðŸ‡·ðŸ‡º Russia", "ðŸ‡¸ðŸ‡¦ Saudi Arabia", "ðŸ‡¸ðŸ‡¬ Singapore", 
            "ðŸ‡¿ðŸ‡¦ South Africa", "ðŸ‡°ðŸ‡· South Korea", "ðŸ‡ªðŸ‡¸ Spain", "ðŸ‡±ðŸ‡° Sri Lanka", "ðŸ‡¸ðŸ‡ª Sweden", 
            "ðŸ‡¨ðŸ‡­ Switzerland", "ðŸ‡¸ðŸ‡¾ Syria", "ðŸ‡¹ðŸ‡¼ Taiwan", "ðŸ‡¹ðŸ‡­ Thailand", "ðŸ‡¹ðŸ‡· Turkey", 
            "ðŸ‡ºðŸ‡¦ Ukraine", "ðŸ‡¬ðŸ‡§ United Kingdom", "ðŸ‡ºðŸ‡¸ United States", "ðŸ‡»ðŸ‡³ Vietnam"
        ];

        const initialPublishedVersionCode = 100;
        const dietOptions = ['Vegan', 'Vegetarian', 'Pescatarian', 'Gluten-free', 'Dairy-free', 'Nut-free', 'Egg-free', 'Soy-free', 'Halal', 'Kosher', 'Low-carb', 'Keto', 'Paleo'];
        const dietDescriptions = {
            'Vegan': 'No animal products whatsoever â€” excludes meat, fish, dairy, eggs, and honey.',
            'Vegetarian': 'No meat or fish, but may include dairy and eggs.',
            'Pescatarian': 'No meat, but fish and seafood are allowed alongside plant-based foods.',
            'Gluten-free': 'Contains no gluten â€” safe for people with coeliac disease or gluten sensitivity.',
            'Dairy-free': 'Contains no milk, cheese, butter, cream, or other dairy products.',
            'Nut-free': 'Contains no tree nuts or peanuts â€” suitable for those with nut allergies.',
            'Egg-free': 'Contains no eggs or egg-derived ingredients.',
            'Soy-free': 'Contains no soy or soy-derived ingredients such as tofu or edamame.',
            'Halal': 'Prepared according to Islamic dietary law â€” no pork or alcohol.',
            'Kosher': 'Prepared according to Jewish dietary law â€” no mixing of meat and dairy.',
            'Low-carb': 'Significantly reduced carbohydrate content, typically under 100g of carbs per day.',
            'Keto': 'Very low carb and high fat diet designed to induce a state of ketosis.',
            'Paleo': 'Based on foods presumed to be available to pre-agricultural humans â€” no grains, legumes, or processed foods.',
        };
        const dietCompatibilityMap = {
            'Vegan': ['Vegan', 'Vegetarian', 'Pescatarian', 'Dairy-free', 'Egg-free'],
            'Vegetarian': ['Vegetarian', 'Pescatarian'],
            'Pescatarian': ['Pescatarian'],
            'Gluten-free': ['Gluten-free'],
            'Dairy-free': ['Dairy-free'],
            'Nut-free': ['Nut-free'],
            'Egg-free': ['Egg-free'],
            'Soy-free': ['Soy-free'],
            'Halal': ['Halal'],
            'Kosher': ['Kosher'],
            'Low-carb': ['Low-carb'],
            'Keto': ['Keto', 'Low-carb'],
            'Paleo': ['Paleo']
        };
        const supportedDietOptionsText = dietOptions.join(', ');

        function applyMeasurementSystem(text) {
            if (!userSettings.measurementSystem || userSettings.measurementSystem === 'Metric') return text;
            let resultText = text;
            resultText = resultText.replace(/(\d+[\.,]?\d*)\s*(g|gr|gram|grams)\b/gi, (match, numStr) => {
                let num = parseFloat(numStr.replace(',', '.'));
                let oz = (num * 0.035274).toFixed(1).replace('.0', '');
                let extra = "";
                let lowerText = text.toLowerCase();
                if (lowerText.includes('flour') || lowerText.includes('bloem')) extra = ` / ~${(num / 120).toFixed(1).replace('.0', '')} cups`;
                else if (lowerText.includes('sugar') || lowerText.includes('suiker')) extra = ` / ~${(num / 200).toFixed(1).replace('.0', '')} cups`;
                else if (lowerText.includes('butter') || lowerText.includes('boter')) extra = ` / ~${(num / 14.2).toFixed(1).replace('.0', '')} tbsp`;
                return `${match} (${oz} oz${extra})`;
            });
            resultText = resultText.replace(/(\d+[\.,]?\d*)\s*(ml|milliliter|milliliters)\b/gi, (match, numStr) => {
                let num = parseFloat(numStr.replace(',', '.'));
                let flOz = (num * 0.033814).toFixed(1).replace('.0', '');
                if (num >= 240) return `${match} (${flOz} fl oz / ~${(num / 240).toFixed(1).replace('.0', '')} cups)`;
                return `${match} (${flOz} fl oz / ~${(num / 15).toFixed(1).replace('.0', '')} tbsp)`;
            });
            resultText = resultText.replace(/(\d+[\.,]?\d*)\s*(kg|kilo|kilograms)\b/gi, (match, numStr) => {
                let num = parseFloat(numStr.replace(',', '.'));
                return `${match} (${(num * 2.20462).toFixed(1).replace('.0', '')} lbs)`;
            });
            resultText = resultText.replace(/(\d+[\.,]?\d*)\s*(c|Â°c|celsius)\b/gi, (match, numStr) => {
                let num = parseFloat(numStr.replace(',', '.'));
                let f = Math.round((num * 9/5) + 32);
                return `${match} (${f}Â°F)`;
            });
            return resultText;
        }

        function changeGlobalLanguage(langCode) {
            const checkExist = setInterval(function() {
                let combo = document.querySelector('.goog-te-combo');
                if (combo) {
                    if (combo.value !== langCode) {
                        combo.value = langCode;
                        combo.dispatchEvent(new Event('change'));
                    }
                    clearInterval(checkExist);
                }
            }, 200);
        }

        function escapeHTML(value = '') {
            return String(value).replace(/[&<>"']/g, char => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char]));
        }

        function getDefaultNotebookCoverSticker(seed = 0) {
            const presets = [
                { text: 'SOUP', emoji: 'ðŸ¥£', color: 'blue', background: 'solid', x: 80, y: 20, size: 'md', rotation: -6 },
                { text: 'COSY', emoji: 'âœ¨', color: 'gold', background: 'solid', x: 24, y: 78, size: 'sm', rotation: 5 },
                { text: 'HOME', emoji: 'ðŸ¡', color: 'sage', background: 'solid', x: 76, y: 78, size: 'md', rotation: -3 }
            ];
            const preset = presets[seed % presets.length];
            return {
                id: `cover-sticker-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                ...preset
            };
        }

        function getNotebookCoverStickerEmojiOptions() {
            return [
                { value: '', label: 'No emoji' },
                { value: 'ðŸ¥£', label: 'ðŸ¥£ Bowl' },
                { value: 'ðŸ²', label: 'ðŸ² Stew' },
                { value: 'ðŸœ', label: 'ðŸœ Noodles' },
                { value: 'ðŸ°', label: 'ðŸ° Cake' },
                { value: 'ðŸ¥–', label: 'ðŸ¥– Bread' },
                { value: 'â˜•', label: 'â˜• Coffee' },
                { value: 'ðŸ‹', label: 'ðŸ‹ Lemon' },
                { value: 'ðŸŒ¿', label: 'ðŸŒ¿ Herb' },
                { value: 'ðŸ„', label: 'ðŸ„ Mushroom' },
                { value: 'ðŸ”¥', label: 'ðŸ”¥ Flame' },
                { value: 'âœ¨', label: 'âœ¨ Sparkles' },
                { value: 'ðŸ’›', label: 'ðŸ’› Heart' },
                { value: 'ðŸ“–', label: 'ðŸ“– Book' },
                { value: 'ðŸ§', label: 'ðŸ§ Cupcake' },
                { value: 'ðŸ“', label: 'ðŸ“ Strawberry' },
                { value: 'ðŸ¥•', label: 'ðŸ¥• Carrot' },
                { value: 'ðŸ§„', label: 'ðŸ§„ Garlic' },
                { value: 'ðŸ§ˆ', label: 'ðŸ§ˆ Butter' },
                { value: 'ðŸŒž', label: 'ðŸŒž Sun' },
                { value: 'ðŸŒ™', label: 'ðŸŒ™ Moon' }
            ];
        }

        function getDefaultNotebookCover() {
            return {
                palette: 'oat',
                title: '',
                subtitle: '',
                spineLabel: '',
                stickers: []
            };
        }

        function normalizeNotebookCover(cover) {
            const base = getDefaultNotebookCover();
            const nextCover = { ...base, ...(cover || {}) };
            const normalizedSpineLabel = String(cover?.spineLabel ?? '').trim();
            const incomingStickers = Array.isArray(cover?.stickers) ? cover.stickers.slice(0, 6) : [];
            nextCover.spineLabel = normalizedSpineLabel === 'Uculi' ? '' : normalizedSpineLabel;
            nextCover.stickers = incomingStickers.map((sticker, index) => ({
                ...getDefaultNotebookCoverSticker(index),
                ...(sticker || {}),
                id: sticker?.id || `cover-sticker-${Date.now()}-${index}`,
                rotation: Number(sticker?.rotation ?? getDefaultNotebookCoverSticker(index).rotation),
                emoji: sticker?.emoji ?? getDefaultNotebookCoverSticker(index).emoji ?? '',
                background: sticker?.background === 'none' ? 'none' : 'solid',
                x: Number.isFinite(Number(sticker?.x)) ? Number(sticker.x) : getNotebookCoverStickerCoordinates(sticker?.position || getDefaultNotebookCoverSticker(index).position).x,
                y: Number.isFinite(Number(sticker?.y)) ? Number(sticker.y) : getNotebookCoverStickerCoordinates(sticker?.position || getDefaultNotebookCoverSticker(index).position).y
            }));
            return nextCover;
        }

        function getNotebookCoverPalette(palette) {
            const palettes = {
                oat: {
                    surface: 'radial-gradient(circle at top left, rgba(255,255,255,0.42), transparent 28%), linear-gradient(135deg, #ddd0b9 0%, #c5b18d 48%, #aa9065 100%)',
                    border: '#b59f79',
                    spine: 'linear-gradient(180deg, rgba(102,74,33,0.72), rgba(72,54,29,0.92))',
                    plate: 'rgba(255,255,255,0.58)',
                    plateBorder: 'rgba(88,62,31,0.16)',
                    ink: '#2b241a'
                },
                sage: {
                    surface: 'radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 28%), linear-gradient(135deg, #91a392 0%, #70856f 50%, #57695a 100%)',
                    border: '#637566',
                    spine: 'linear-gradient(180deg, rgba(58,83,63,0.82), rgba(37,56,42,0.96))',
                    plate: 'rgba(248,250,248,0.4)',
                    plateBorder: 'rgba(38,57,44,0.18)',
                    ink: '#f4efe6'
                },
                berry: {
                    surface: 'radial-gradient(circle at top left, rgba(255,255,255,0.16), transparent 28%), linear-gradient(135deg, #b47074 0%, #91545d 50%, #6f3847 100%)',
                    border: '#7b4b53',
                    spine: 'linear-gradient(180deg, rgba(111,56,71,0.9), rgba(72,30,42,0.98))',
                    plate: 'rgba(255,244,245,0.26)',
                    plateBorder: 'rgba(79,30,43,0.16)',
                    ink: '#fff5f1'
                },
                midnight: {
                    surface: 'radial-gradient(circle at top left, rgba(255,255,255,0.1), transparent 28%), linear-gradient(135deg, #324550 0%, #24313a 50%, #182027 100%)',
                    border: '#2b3c46',
                    spine: 'linear-gradient(180deg, rgba(17,26,33,0.9), rgba(8,13,17,0.98))',
                    plate: 'rgba(242,247,250,0.14)',
                    plateBorder: 'rgba(220,235,243,0.08)',
                    ink: '#edf4f7'
                },
                sunflower: {
                    surface: 'radial-gradient(circle at top left, rgba(255,255,255,0.28), transparent 28%), linear-gradient(135deg, #f1d676 0%, #ddb34f 48%, #ba8830 100%)',
                    border: '#c29842',
                    spine: 'linear-gradient(180deg, rgba(133,92,22,0.78), rgba(99,66,13,0.96))',
                    plate: 'rgba(255,252,241,0.44)',
                    plateBorder: 'rgba(115,82,22,0.14)',
                    ink: '#4a3610'
                }
            };

            return palettes[palette] || palettes.oat;
        }

        function getNotebookCoverStickerPalette(color) {
            const palettes = {
                gold: { bg: '#ecd276', text: '#5b4718' },
                blue: { bg: '#83b7da', text: '#21475e' },
                coral: { bg: '#ef9b82', text: '#5d2f24' },
                sage: { bg: '#95be96', text: '#29432d' },
                lilac: { bg: '#d9beea', text: '#4b3555' },
                cream: { bg: '#f5ead5', text: '#5a4830' }
            };

            return palettes[color] || palettes.gold;
        }

        function getNotebookCoverStickerCoordinates(position) {
            const positions = {
                'top-left': { x: 24, y: 22 },
                'top-right': { x: 80, y: 20 },
                'center': { x: 50, y: 48 },
                'center-right': { x: 78, y: 50 },
                'bottom-left': { x: 26, y: 78 },
                'bottom-right': { x: 78, y: 78 }
            };

            return positions[position] || positions['top-right'];
        }

        function getNotebookCoverStickerSize(size, isEmojiOnly = false, isTransparent = false) {
            if (isEmojiOnly) {
                if (isTransparent) {
                    const floatingEmojiSizes = {
                        sm: 'h-12 w-12 text-3xl',
                        md: 'h-16 w-16 text-4xl',
                        lg: 'h-20 w-20 text-5xl'
                    };

                    return floatingEmojiSizes[size] || floatingEmojiSizes.md;
                }

                const emojiSizes = {
                    sm: 'h-11 w-11 text-2xl',
                    md: 'h-14 w-14 text-3xl',
                    lg: 'h-16 w-16 text-4xl'
                };

                return emojiSizes[size] || emojiSizes.md;
            }

            const sizes = {
                sm: 'min-w-[5rem] px-3 py-2 text-[10px]',
                md: 'min-w-[6.5rem] px-4 py-2.5 text-[11px]',
                lg: 'min-w-[8rem] px-5 py-3 text-xs'
            };

            return sizes[size] || sizes.md;
        }

        function getDefaultNotebookStickyNote(seed = 0) {
            const preset = { x: 66, y: 24, rotation: -4, color: 'butter', size: 'md' };

            return {
                id: `notebook-note-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                text: '',
                color: preset.color,
                size: preset.size,
                scale: 1,
                rotation: preset.rotation,
                x: preset.x,
                y: preset.y
            };
        }

        function clampNotebookStickyNoteX(value) {
            return Math.max(12, Math.min(88, Number(value)));
        }

        function clampNotebookStickyNoteY(value) {
            return Math.max(14, Math.min(84, Number(value)));
        }

        function clampNotebookStickyNoteScale(value) {
            return Math.max(0.72, Math.min(1.45, Number(value) || 1));
        }

        function clampNotebookStickyNoteRotation(value) {
            return Math.max(-28, Math.min(28, Number(value) || 0));
        }

        function getNotebookStickyNotePreviewLimit(note) {
            const sizeLimits = {
                sm: 58,
                md: 84,
                lg: 112
            };

            const baseLimit = sizeLimits[note?.size] || sizeLimits.md;
            return Math.max(28, Math.round(baseLimit * clampNotebookStickyNoteScale(note?.scale ?? 1)));
        }

        function getNotebookStickyNotePreviewText(note) {
            const rawText = String(note?.text ?? '').trim();
            if (!rawText) return 'Write here';

            const previewLimit = getNotebookStickyNotePreviewLimit(note);
            if (rawText.length <= previewLimit) return rawText;

            return `${rawText.slice(0, Math.max(0, previewLimit - 3)).trimEnd()}...`;
        }

        function normalizeNotebookStickyNotes(notes) {
            const allowedColors = ['butter', 'rose', 'sage', 'sky', 'lavender'];
            const allowedSizes = ['sm', 'md', 'lg'];
            const incomingNotes = Array.isArray(notes) ? notes.slice(0, 1) : [];

            return incomingNotes.map((note, index) => {
                const defaults = getDefaultNotebookStickyNote(index);
                const rawText = String(note?.text ?? '').slice(0, 160);

                return {
                    ...defaults,
                    ...(note || {}),
                    id: note?.id || defaults.id,
                    text: rawText,
                    color: allowedColors.includes(note?.color) ? note.color : defaults.color,
                    size: allowedSizes.includes(note?.size) ? note.size : defaults.size,
                    scale: clampNotebookStickyNoteScale(note?.scale ?? defaults.scale),
                    rotation: clampNotebookStickyNoteRotation(note?.rotation ?? defaults.rotation),
                    x: clampNotebookStickyNoteX(Number(note?.x ?? defaults.x) || defaults.x),
                    y: clampNotebookStickyNoteY(Number(note?.y ?? defaults.y) || defaults.y)
                };
            });
        }

        function getNotebookStickyNotePalette(color) {
            const palettes = {
                butter: {
                    bg: 'linear-gradient(180deg, rgba(255,255,255,0.26), rgba(255,255,255,0) 22%), #e9d598',
                    border: '#c8a963',
                    ink: '#5a461b',
                    tape: 'linear-gradient(180deg, rgba(255,248,224,0.94), rgba(234,215,171,0.82))'
                },
                rose: {
                    bg: 'linear-gradient(180deg, rgba(255,255,255,0.24), rgba(255,255,255,0) 22%), #dfb1a3',
                    border: '#bb8a7c',
                    ink: '#55312c',
                    tape: 'linear-gradient(180deg, rgba(255,245,241,0.94), rgba(228,202,194,0.82))'
                },
                sage: {
                    bg: 'linear-gradient(180deg, rgba(255,255,255,0.24), rgba(255,255,255,0) 22%), #c2cfb2',
                    border: '#8ea081',
                    ink: '#2d4131',
                    tape: 'linear-gradient(180deg, rgba(247,250,242,0.94), rgba(214,224,199,0.82))'
                },
                sky: {
                    bg: 'linear-gradient(180deg, rgba(255,255,255,0.24), rgba(255,255,255,0) 22%), #bfd2df',
                    border: '#8da8ba',
                    ink: '#2d495d',
                    tape: 'linear-gradient(180deg, rgba(246,250,255,0.94), rgba(211,224,236,0.82))'
                },
                lavender: {
                    bg: 'linear-gradient(180deg, rgba(255,255,255,0.24), rgba(255,255,255,0) 22%), #d4c6dd',
                    border: '#ae9ab9',
                    ink: '#4b3a53',
                    tape: 'linear-gradient(180deg, rgba(251,246,255,0.94), rgba(223,211,233,0.82))'
                }
            };

            return palettes[color] || palettes.butter;
        }

        function getNotebookStickyNoteSizeClass(size) {
            const sizes = {
                sm: 'notebook-sticky-note--sm',
                md: 'notebook-sticky-note--md',
                lg: 'notebook-sticky-note--lg'
            };

            return sizes[size] || sizes.md;
        }

        function renderNotebookStickyNotes(recipeId, notes, isVisible = true) {
            if (!isVisible || !notes.length) return '';

            return `
                <div class="pointer-events-none absolute inset-0 z-20">
                    ${notes.map((note, index) => {
                        const palette = getNotebookStickyNotePalette(note.color);
                        const noteText = escapeHTML(getNotebookStickyNotePreviewText(note)).replace(/\n/g, '<br>');
                        const noteRotation = clampNotebookStickyNoteRotation(note.rotation);
                        const noteScale = clampNotebookStickyNoteScale(note.scale);
                        const noteIsActive = activeNotebookStickyNoteMenu?.recipeId === recipeId && activeNotebookStickyNoteMenu?.noteIndex === index;
                        const menuPlacementClass = Number(note.y) > 54 ? 'is-above' : 'is-below';
                        const menuAlignmentClass = Number(note.x) < 34 ? 'is-left-aligned' : Number(note.x) > 66 ? 'is-right-aligned' : '';
                        const swatches = ['butter', 'rose', 'sage', 'sky', 'lavender'].map(color => {
                            const swatchPalette = getNotebookStickyNotePalette(color);
                            return `<button type="button" onclick="setNotebookStickyNoteColor(${recipeId}, ${index}, '${color}')" class="notebook-sticky-note-menu-swatch ${note.color === color ? 'is-active' : ''}" style="background:${swatchPalette.bg};" aria-label="Set sticky note color to ${color}"></button>`;
                        }).join('');
                        return `
                            <div class="notebook-sticky-note-anchor ${noteIsActive ? 'is-active' : ''}" data-notebook-note-index="${index}" style="left:${clampNotebookStickyNoteX(note.x)}%;top:${clampNotebookStickyNoteY(note.y)}%;">
                                <article class="notebook-sticky-note ${getNotebookStickyNoteSizeClass(note.size)}" data-notebook-note-card="true" style="--sticky-note-bg:${palette.bg};--sticky-note-border:${palette.border};--sticky-note-ink:${palette.ink};--sticky-note-tape:${palette.tape};transform:rotate(${noteRotation}deg) scale(${noteScale});">
                                    <button type="button" class="notebook-sticky-note-handle top-left" data-notebook-note-handle="top-left" aria-label="Resize and rotate sticky note"></button>
                                    <button type="button" class="notebook-sticky-note-handle top-right" data-notebook-note-handle="top-right" aria-label="Resize and rotate sticky note"></button>
                                    <button type="button" class="notebook-sticky-note-handle bottom-left" data-notebook-note-handle="bottom-left" aria-label="Resize and rotate sticky note"></button>
                                    <button type="button" class="notebook-sticky-note-handle bottom-right" data-notebook-note-handle="bottom-right" aria-label="Resize and rotate sticky note"></button>
                                    <span class="notebook-sticky-note-tape" aria-hidden="true"></span>
                                    <div class="notebook-sticky-note__body">
                                        <p class="notebook-sticky-note__text font-semibold" data-notebook-note-preview="${note.id}">${noteText}</p>
                                    </div>
                                </article>
                                ${noteIsActive ? `
                                    <div class="notebook-sticky-note-menu ${menuPlacementClass} ${menuAlignmentClass}" data-notebook-note-menu="true">
                                        <div class="flex items-center justify-between gap-3">
                                            <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-sage">Sticky note</p>
                                            <button type="button" onclick="closeNotebookStickyNoteMenu()" class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-parchmentDark bg-white text-sage shadow-sm">
                                                <i data-lucide="x" class="h-4 w-4"></i>
                                            </button>
                                        </div>
                                        <textarea maxlength="160" data-notebook-note-editor="${recipeId}-${index}" aria-label="Sticky note text" oninput="updateNotebookStickyNoteText(${recipeId}, ${index}, this.value)" class="mt-3 w-full min-h-[6.5rem] rounded-xl border border-sage border-opacity-20 bg-white px-4 py-3 text-sm font-semibold text-forest shadow-sm outline-none focus:border-gold resize-y md:min-h-[7rem]" placeholder="Add a quick reminder...">${escapeHTML(note.text || '')}</textarea>
                                        <div class="mt-3 flex items-center justify-between gap-3">
                                            <div class="flex flex-nowrap items-center gap-1.5">${swatches}</div>
                                            <button type="button" title="Delete sticky note" aria-label="Delete sticky note" onclick="deleteNotebookStickyNote(${recipeId}, ${index})" class="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-parchmentDark bg-white text-sage shadow-sm transition-all hover:border-red-400 hover:text-red-500">
                                                <i data-lucide="trash-2" class="h-4 w-4"></i>
                                            </button>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        function getNotebookCoverPanelStyle(cover) {
            const palette = getNotebookCoverPalette(cover.palette);
            return `--cover-surface:${palette.surface};--cover-spine:${palette.spine};--cover-plate:${palette.plate};--cover-plate-border:${palette.plateBorder};--cover-ink:${palette.ink};border-color:${palette.border};color:${palette.ink};`;
        }

        function renderNotebookCoverStickers(cover, isEditorPreview = false) {
            return (cover.stickers || []).map((sticker, index) => {
                const stickerPalette = getNotebookCoverStickerPalette(sticker.color);
                const rawStickerText = (sticker.text || '').trim();
                const stickerEmoji = escapeHTML((sticker.emoji || '').trim());
                const stickerText = escapeHTML(rawStickerText || (!stickerEmoji ? 'STICKER' : ''));
                const isEmojiOnly = Boolean(stickerEmoji && !rawStickerText);
                const isTransparent = sticker.background === 'none';
                const stickerSizeClass = getNotebookCoverStickerSize(sticker.size, isEmojiOnly, isTransparent);
                const stickerX = Math.max(8, Math.min(92, Number(sticker.x) || 50));
                const stickerY = Math.max(10, Math.min(90, Number(sticker.y) || 50));
                const wrapperClasses = isEditorPreview ? 'cover-editor-preview-sticker' : '';
                const stickerTone = isTransparent && !isEmojiOnly ? `text-shadow:0 1px 2px rgba(255,255,255,0.28);` : '';
                const floatingEmojiMarkup = isTransparent && isEmojiOnly ? `
                    <span class="notebook-cover-sticker-tape left" aria-hidden="true"></span>
                    <span class="notebook-cover-sticker-tape right" aria-hidden="true"></span>
                ` : '';
                return `
                    <div class="absolute ${wrapperClasses}" data-cover-sticker-index="${index}" style="left:${stickerX}%; top:${stickerY}%; transform:translate(-50%, -50%);">
                        <div class="notebook-cover-sticker ${isTransparent ? 'is-transparent' : ''} ${isTransparent && isEmojiOnly ? 'is-floating-emoji relative isolate' : ''} rounded-2xl font-bold uppercase tracking-[0.18em] ${stickerSizeClass} ${isEmojiOnly ? 'flex items-center justify-center' : ''}" style="background:${isTransparent ? 'transparent' : stickerPalette.bg};color:${stickerPalette.text};transform:rotate(${Number(sticker.rotation) || 0}deg);${stickerTone}">
                            ${floatingEmojiMarkup}
                            <span class="inline-flex items-center ${isEmojiOnly ? '' : 'gap-2'} leading-none">
                                ${stickerEmoji ? `<span class="${isEmojiOnly ? 'text-[1em]' : 'text-base'}" aria-hidden="true">${stickerEmoji}</span>` : ''}
                                ${stickerText ? `<span>${stickerText}</span>` : ''}
                            </span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function renderNotebookCoverFace(cover, previewRecipe, totalPages, isEditorPreview = false) {
            const safeCover = normalizeNotebookCover(cover);
            const title = escapeHTML((safeCover.title || '').trim());
            const subtitle = escapeHTML((safeCover.subtitle || '').trim());
            const spineLabel = escapeHTML((safeCover.spineLabel || '').trim());

            return `
                <div class="ml-10 relative h-full md:ml-12">
                    <div class="relative z-20 flex items-start justify-end gap-4 pt-1">
                        ${!isEditorPreview ? `
                            <button onclick="event.stopPropagation(); openCoverEditor()" onpointerdown="event.stopPropagation()" class="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white border-opacity-30 bg-white bg-opacity-20 px-4 text-[10px] font-bold uppercase tracking-[0.18em] shadow-sm backdrop-blur-sm">
                                <i data-lucide="pencil-ruler" class="h-4 w-4"></i> Edit
                            </button>
                        ` : ''}
                    </div>

                    <div class="relative z-0 pr-16 pt-6">
                        ${spineLabel ? `<div class="notebook-cover-plate inline-flex items-center rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] shadow-sm">${spineLabel}</div>` : ''}
                        ${title ? `<h3 class="${spineLabel ? 'mt-8' : 'mt-4'} max-w-xl font-fantasy text-5xl font-bold leading-[0.95] md:text-6xl">${title}</h3>` : ''}
                        ${subtitle ? `<p class="mt-5 max-w-lg text-sm font-semibold opacity-85 md:text-base">${subtitle}</p>` : ''}
                    </div>

                    <div class="absolute inset-0 z-10">
                        ${renderNotebookCoverStickers(safeCover, isEditorPreview)}
                    </div>
                </div>
            `;
        }

        function openCoverEditor() { if(!userSettings.premium) { showPremiumModal("customize notebook covers"); return; }
            draftNotebookCover = JSON.parse(JSON.stringify(normalizeNotebookCover(userSettings.notebookCover)));
            const modal = document.getElementById('cover-editor-modal');
            if (!modal) return;
            renderCoverEditor();
            modal.classList.remove('hidden', 'opacity-0', 'scale-95');
        }

        function closeCoverEditor() {
            const modal = document.getElementById('cover-editor-modal');
            if (!modal) return;
            modal.classList.add('hidden', 'opacity-0', 'scale-95');
            draftNotebookCover = null;
        }

        function setDraftCoverField(field, value) {
            if (!draftNotebookCover) return;
            draftNotebookCover[field] = value;
            renderCoverEditor();
        }

        function setDraftCoverPalette(palette) {
            if (!draftNotebookCover) return;
            draftNotebookCover.palette = palette;
            renderCoverEditor();
        }

        function addDraftCoverSticker() {
            if (!draftNotebookCover) return;
            if (draftNotebookCover.stickers.length >= 6) {
                showToast('Maximum 6 cover stickers', 'stickers');
                return;
            }

            draftNotebookCover.stickers.push(getDefaultNotebookCoverSticker(draftNotebookCover.stickers.length));
            renderCoverEditor();
        }

        function updateDraftCoverSticker(index, field, value) {
            if (!draftNotebookCover?.stickers?.[index]) return;
            draftNotebookCover.stickers[index][field] = field === 'rotation' ? Number(value) : value;
            renderCoverEditor();
        }

        function updateDraftCoverStickerPosition(index, x, y) {
            if (!draftNotebookCover?.stickers?.[index]) return;
            draftNotebookCover.stickers[index].x = Math.max(8, Math.min(92, Number(x)));
            draftNotebookCover.stickers[index].y = Math.max(10, Math.min(90, Number(y)));
        }

        function attachCoverEditorInteractions() {
            const previewSurface = document.getElementById('cover-editor-preview-surface');
            if (!previewSurface) return;

            previewSurface.querySelectorAll('[data-cover-sticker-index]').forEach(stickerEl => {
                stickerEl.addEventListener('pointerdown', event => {
                    if (event.pointerType === 'mouse' && event.button !== 0) return;

                    event.preventDefault();
                    const stickerIndex = Number(stickerEl.dataset.coverStickerIndex);
                    const rect = previewSurface.getBoundingClientRect();

                    const moveSticker = moveEvent => {
                        const relativeX = ((moveEvent.clientX - rect.left) / rect.width) * 100;
                        const relativeY = ((moveEvent.clientY - rect.top) / rect.height) * 100;
                        updateDraftCoverStickerPosition(stickerIndex, relativeX, relativeY);
                        stickerEl.style.left = `${Math.max(8, Math.min(92, relativeX))}%`;
                        stickerEl.style.top = `${Math.max(10, Math.min(90, relativeY))}%`;
                    };

                    const stopDragging = () => {
                        window.removeEventListener('pointermove', moveSticker);
                        window.removeEventListener('pointerup', stopDragging);
                        window.removeEventListener('pointercancel', stopDragging);
                    };

                    window.addEventListener('pointermove', moveSticker);
                    window.addEventListener('pointerup', stopDragging);
                    window.addEventListener('pointercancel', stopDragging);
                    stickerEl.setPointerCapture?.(event.pointerId);
                });
            });
        }

        function removeDraftCoverSticker(index) {
            if (!draftNotebookCover) return;
            draftNotebookCover.stickers.splice(index, 1);
            renderCoverEditor();
        }

        function saveCoverEditor() {
            userSettings.notebookCover = normalizeNotebookCover(draftNotebookCover);
            saveData();
            closeCoverEditor();
            showToast('Cover saved!', 'book-open');
            if (currentView === 'index' && indexViewMode === 'book') {
                renderList();
            }
        }

        function renderCoverEditor() {
            const body = document.getElementById('cover-editor-body');
            if (!body || !draftNotebookCover) return;

            const previewRecipe = recipes.find(recipe => recipe.id === currentIndexRecipeIds[notebookPageIndex]) || recipes[0] || null;
            const totalPages = Math.max(1, currentIndexRecipeIds.length || recipes.length || 1);
            const stickerEmojiOptions = getNotebookCoverStickerEmojiOptions();
            const paletteOptions = [
                { key: 'oat', label: 'Oat' },
                { key: 'sage', label: 'Sage' },
                { key: 'berry', label: 'Berry' },
                { key: 'midnight', label: 'Midnight' },
                { key: 'sunflower', label: 'Sunflower' }
            ];

            body.innerHTML = `
                <div class="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr,0.9fr]">
                    <div class="rounded-[28px] border border-parchmentDark bg-accent bg-opacity-40 p-5 md:p-6">
                        <p class="text-[11px] font-bold uppercase tracking-[0.3em] text-sage opacity-80">Live preview</p>
                        <div class="notebook-cover-shell notebook-book-cover-frame mt-5">
                            <div id="cover-editor-preview-surface" class="notebook-book-cover-surface notebook-cover-panel overflow-hidden rounded-[32px] border px-7 py-7 text-[#2b241a] md:px-10 md:py-10" style="${getNotebookCoverPanelStyle(draftNotebookCover)}">
                                ${renderNotebookCoverFace(draftNotebookCover, previewRecipe, totalPages, true)}
                            </div>
                        </div>
                        <p class="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-sage opacity-80">Drag stickers directly on the preview to place them on the cover.</p>
                    </div>

                    <div class="space-y-5">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-2">Title</label>
                                <input type="text" maxlength="40" value="${escapeHTML(draftNotebookCover.title || '')}" oninput="setDraftCoverField('title', this.value)" class="${inputClass}" placeholder="Kitchen Notebook">
                            </div>
                            <div>
                                <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-2">Spine Label</label>
                                <input type="text" maxlength="28" value="${escapeHTML(draftNotebookCover.spineLabel || '')}" oninput="setDraftCoverField('spineLabel', this.value)" class="${inputClass}" placeholder="Uculi">
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-2">Subtitle</label>
                                <textarea oninput="setDraftCoverField('subtitle', this.value)" class="${textareaClass}" placeholder="Add a personal line on the cover...">${escapeHTML(draftNotebookCover.subtitle || '')}</textarea>
                            </div>
                        </div>

                        <div class="rounded-xl border border-parchmentDark bg-white p-4">
                            <div class="flex items-center justify-between gap-3 mb-4">
                                <p class="text-xs font-bold uppercase tracking-[0.22em] text-sage">Cover Palette</p>
                                <i data-lucide="palette" class="w-4 h-4 text-gold"></i>
                            </div>
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                ${paletteOptions.map(option => {
                                    const palette = getNotebookCoverPalette(option.key);
                                    return `
                                        <button type="button" onclick="setDraftCoverPalette('${option.key}')" class="rounded-xl border p-3 text-left ${draftNotebookCover.palette === option.key ? 'border-gold shadow-md' : 'border-parchmentDark'}">
                                            <span class="block h-10 rounded-lg" style="background:${palette.surface};"></span>
                                            <span class="mt-2 block text-xs font-bold uppercase tracking-[0.2em] text-sage">${option.label}</span>
                                        </button>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        <div class="rounded-xl border border-parchmentDark bg-white p-4">
                            <div class="flex items-center justify-between gap-3 mb-4">
                                <div>
                                    <p class="text-xs font-bold uppercase tracking-[0.22em] text-sage">Cover Stickers</p>
                                    <p class="text-[10px] text-sage mt-1 font-semibold">Add up to 6 stickers for a more personal front cover.</p>
                                </div>
                                <button type="button" onclick="addDraftCoverSticker()" class="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-parchmentDark bg-white px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-sage shadow-sm">
                                    <i data-lucide="plus" class="w-4 h-4"></i> Add sticker
                                </button>
                            </div>

                            <div class="space-y-4">
                                ${draftNotebookCover.stickers.length > 0 ? draftNotebookCover.stickers.map((sticker, index) => `
                                    <div class="rounded-xl border border-parchmentDark bg-accent bg-opacity-25 p-4 space-y-4">
                                        <div class="flex items-center justify-between gap-3">
                                            <p class="text-xs font-bold uppercase tracking-[0.2em] text-sage">Sticker ${index + 1}</p>
                                            <button type="button" onclick="removeDraftCoverSticker(${index})" class="w-9 h-9 rounded-full border border-parchmentDark bg-white text-sage flex items-center justify-center shadow-sm">
                                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                                            </button>
                                        </div>

                                        <div>
                                            <label class="block text-[11px] font-bold uppercase tracking-[0.2em] text-sage mb-2">Sticker Text</label>
                                            <input type="text" maxlength="18" value="${escapeHTML(sticker.text || '')}" oninput="updateDraftCoverSticker(${index}, 'text', this.value)" class="${inputClass}" placeholder="SOUP CLUB">
                                            <p class="mt-1 text-[10px] font-semibold text-sage">Leave this empty if you want an emoji-only sticker.</p>
                                        </div>

                                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label class="block text-[11px] font-bold uppercase tracking-[0.2em] text-sage mb-2">Emoji</label>
                                                <select onchange="updateDraftCoverSticker(${index}, 'emoji', this.value)" class="${inputClass}">
                                                    ${stickerEmojiOptions.map(option => `<option value="${escapeHTML(option.value)}" ${sticker.emoji === option.value ? 'selected' : ''}>${option.label}</option>`).join('')}
                                                </select>
                                            </div>
                                            <div>
                                                <label class="block text-[11px] font-bold uppercase tracking-[0.2em] text-sage mb-2">Color</label>
                                                <select onchange="updateDraftCoverSticker(${index}, 'color', this.value)" class="${inputClass}">
                                                    <option value="gold" ${sticker.color === 'gold' ? 'selected' : ''}>Gold</option>
                                                    <option value="blue" ${sticker.color === 'blue' ? 'selected' : ''}>Blue</option>
                                                    <option value="coral" ${sticker.color === 'coral' ? 'selected' : ''}>Coral</option>
                                                    <option value="sage" ${sticker.color === 'sage' ? 'selected' : ''}>Sage</option>
                                                    <option value="lilac" ${sticker.color === 'lilac' ? 'selected' : ''}>Lilac</option>
                                                    <option value="cream" ${sticker.color === 'cream' ? 'selected' : ''}>Cream</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label class="block text-[11px] font-bold uppercase tracking-[0.2em] text-sage mb-2">Background</label>
                                                <select onchange="updateDraftCoverSticker(${index}, 'background', this.value)" class="${inputClass}">
                                                    <option value="solid" ${sticker.background !== 'none' ? 'selected' : ''}>Sticker</option>
                                                    <option value="none" ${sticker.background === 'none' ? 'selected' : ''}>Transparent</option>
                                                </select>
                                                <p class="mt-1 text-[10px] font-semibold text-sage">Transparent works especially well for emoji-only stickers.</p>
                                            </div>
                                            <div>
                                                <label class="block text-[11px] font-bold uppercase tracking-[0.2em] text-sage mb-2">Size</label>
                                                <select onchange="updateDraftCoverSticker(${index}, 'size', this.value)" class="${inputClass}">
                                                    <option value="sm" ${sticker.size === 'sm' ? 'selected' : ''}>Small</option>
                                                    <option value="md" ${sticker.size === 'md' ? 'selected' : ''}>Medium</option>
                                                    <option value="lg" ${sticker.size === 'lg' ? 'selected' : ''}>Large</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label class="block text-[11px] font-bold uppercase tracking-[0.2em] text-sage mb-2">Rotation</label>
                                                <input type="range" min="-18" max="18" step="3" value="${Number(sticker.rotation) || 0}" oninput="updateDraftCoverSticker(${index}, 'rotation', this.value)" class="w-full accent-[#C5A059] mt-3">
                                                <p class="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-sage">${Number(sticker.rotation) || 0}Â°</p>
                                            </div>
                                        </div>
                                    </div>
                                `).join('') : '<div class="rounded-xl border border-dashed border-parchmentDark p-4 text-sm font-semibold text-sage">No stickers yet. Add one to start decorating your cover.</div>'}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            lucide.createIcons();
            attachCoverEditorInteractions();
        }

        function focusNotebookStickyNoteEditor(recipeId, noteIndex) {
            requestAnimationFrame(() => {
                const editor = document.querySelector(`[data-notebook-note-editor="${recipeId}-${noteIndex}"]`);
                if (!(editor instanceof HTMLTextAreaElement)) return;

                editor.focus({ preventScroll: true });
                const textLength = editor.value.length;
                editor.setSelectionRange(textLength, textLength);
            });
        }

        function openNotebookStickyNotesEditor(recipeId) { if(!userSettings.premium) { showPremiumModal("use sticky notes"); return; }
            const recipe = recipes.find(item => item.id === recipeId);
            if (!recipe) return;

            const normalizedNotes = normalizeNotebookStickyNotes(recipe.notebookStickyNotes);
            const hadOverflowNotes = Array.isArray(recipe.notebookStickyNotes) && recipe.notebookStickyNotes.length !== normalizedNotes.length;
            recipe.notebookStickyNotes = normalizedNotes;

            let shouldSave = false;
            let createdNote = false;
            if (hadOverflowNotes) {
                shouldSave = true;
            }

            if (!recipe.notebookStickyNotes.length) {
                recipe.notebookStickyNotes = [getDefaultNotebookStickyNote()];
                shouldSave = true;
                createdNote = true;
            }

            if (userSettings.showNotebookStickyNotes === false) {
                userSettings.showNotebookStickyNotes = true;
                shouldSave = true;
            }

            if (shouldSave) {
                saveData();
            }

            openNotebookStickyNoteMenu(recipeId, 0);

            if (createdNote) {
                showToast('Sticky note added. Type directly on the spread.', 'sticky-note');
            }
        }

        function loadData() {
            const savedSettings = localStorage.getItem('recipeArchiveSettings');
            if (savedSettings) userSettings = { ...userSettings, ...JSON.parse(savedSettings) };

            delete userSettings.themeMode;
            userSettings.notebookCover = normalizeNotebookCover(userSettings.notebookCover);
            document.getElementById('body')?.classList.remove('theme-dark');
            document.documentElement.style.colorScheme = 'light';
            indexViewMode = userSettings.indexViewMode === 'book' ? 'book' : 'cards';

            if(userSettings.language && userSettings.language !== 'en') {
                changeGlobalLanguage(userSettings.language);
            }

            const savedRecipes = localStorage.getItem('recipeArchiveData');
            if (savedRecipes) {
                recipes = JSON.parse(savedRecipes).map(recipe => ({
                    ...recipe,
                    notebookStickyNotes: normalizeNotebookStickyNotes(recipe.notebookStickyNotes)
                }));
            } else {
                recipes = [{
                    id: 1,
                    title: "Forester's Mushroom Stew",
                    author: "House Recipe",
                    source: "local",
                    category: "Cooking",
                    country: "ðŸ‡³ðŸ‡± Netherlands",
                    profile: defaultPlaceholderProfile,
                    prepTime: 15,
                    cookTime: 40,
                    servings: 4,
                    difficulty: "Easy",
                    diet: [],
                    cuisine: "European",
                    ingredients: ["500g Mushrooms", "4 Potatoes", "2 cloves of Garlic", "100ml Red Wine", "2 Carrots", "1 Onion"],
                    instructions: [
                        "Chop all vegetables and mushrooms into rough chunks.",
                        "Fry the onions until translucent, then add the mushrooms and garlic.",
                        "Deglaze the pan with red wine.",
                        "Bake at 180Â°C or let simmer for 40 minutes."
                    ],
                    tips: "Serve with a thick slice of rustic bread! The sauce is amazing when soaked up.",
                    lastOpened: Date.now(),
                    checkedIngredients: [],
                    checkedSteps: [],
                    personalNotes: "",
                    notebookStickyNotes: []
                }];
                saveData();
            }
        }

        function saveData() {
            localStorage.setItem('recipeArchiveSettings', JSON.stringify(userSettings));
            localStorage.setItem('recipeArchiveData', JSON.stringify(recipes));
        }

        // --- PHASE 2: FIREBASE BACKEND ---
        let currentUser = null;
        let isAuthenticated = false;
        let firebaseInitialized = false;
        let publishedRecipesCache = [];

        function initializeFirebase() {
            const firebaseConfig = {
                apiKey: "YOUR_API_KEY",
                authDomain: "YOUR_AUTH_DOMAIN",
                projectId: "YOUR_PROJECT_ID",
                storageBucket: "YOUR_STORAGE_BUCKET",
                messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
                appId: "YOUR_APP_ID"
            };

            if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY') {
                return;
            }

            try {
                if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
                firebaseInitialized = true;

                firebase.auth().onAuthStateChanged(user => {
                    currentUser = user;
                    isAuthenticated = !!user;
                    if (user) {
                        userSettings.email = user.email || userSettings.email || '';
                        userSettings.name = user.displayName || userSettings.name;
                        userSettings.profilePic = user.photoURL || userSettings.profilePic;
                        saveData();
                        setTimeout(() => checkFamilyRemovals(), 1000);
                    }
                });
            } catch (error) {
                console.error('Firebase initialization error:', error);
            }
        }

        async function signInWithGoogle() {
            if (!firebaseInitialized) {
                showToast('Firebase not configured yet. Add your config first.', 'alert-circle');
                return;
            }

            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                const result = await firebase.auth().signInWithPopup(provider);
                currentUser = result.user;
                isAuthenticated = true;
                userSettings.email = currentUser.email || userSettings.email || '';
                userSettings.name = currentUser.displayName || userSettings.name;
                userSettings.profilePic = currentUser.photoURL || userSettings.profilePic;
                saveData();
                await syncToFirestore();
                showToast(`Welcome, ${currentUser.displayName || 'Chef'}!`, 'check-circle');
            } catch (error) {
                showToast(`Auth error: ${error.message}`, 'alert-circle');
            }
        }

        async function signOut() {
            if (!firebaseInitialized) return;

            try {
                await firebase.auth().signOut();
                currentUser = null;
                isAuthenticated = false;
                showToast('Signed out successfully', 'check-circle');
                renderList();
            } catch (error) {
                showToast(`Sign out error: ${error.message}`, 'alert-circle');
            }
        }

        async function syncToFirestore() {
            if (!isAuthenticated || !firebaseInitialized || !currentUser) return;

            try {
                const db = firebase.firestore();
                await db.collection('users').doc(currentUser.uid).set({
                    email: currentUser.email || '',
                    displayName: currentUser.displayName || userSettings.name || 'Chef',
                    photoURL: currentUser.photoURL || userSettings.profilePic || '',
                    bannerPic: userSettings.bannerPic || '',
                    country: userSettings.country || '',
                    bio: userSettings.bio || '',
                    isPublic: userSettings.isPublic,
                    updatedAt: new Date()
                }, { merge: true });
            } catch (error) {
                console.error('Firestore sync error:', error);
            }
        }

        function getRecipeInstructionText(step) {
            return typeof step === 'string' ? step : step?.text || '';
        }

        function getRecipeInstructionImage(step) {
            return typeof step === 'string' ? '' : step?.image || '';
        }

        function normalizeRecipeInstructionStep(step) {
            const text = getRecipeInstructionText(step).trim();
            if (!text) return null;

            return {
                text,
                image: getRecipeInstructionImage(step)
            };
        }

        function normalizeRecipeInstructions(steps) {
            return (steps || []).map(normalizeRecipeInstructionStep).filter(Boolean);
        }

        function cloneRecipeInstructionStep(step) {
            const normalizedStep = normalizeRecipeInstructionStep(step);
            return normalizedStep ? { ...normalizedStep } : null;
        }

        function getPublishedVersionCode(recipe) {
            if (!recipe) return initialPublishedVersionCode;

            const numericCode = Number(recipe.publishedVersionCode);
            if (Number.isFinite(numericCode) && numericCode >= initialPublishedVersionCode) {
                return Math.round(numericCode);
            }

            const numericVersion = Number.parseFloat(recipe.publishedVersion);
            if (Number.isFinite(numericVersion) && numericVersion >= 1) {
                return Math.round(numericVersion * 100);
            }

            return initialPublishedVersionCode;
        }

        function formatPublishedVersion(versionCode) {
            return (versionCode / 100).toFixed(2);
        }

        function getPublishedVersionLabel(recipe) {
            if (!recipe?.publishedId && recipe?.publishedVersionCode == null && recipe?.publishedVersion == null) return '';
            return `v${formatPublishedVersion(getPublishedVersionCode(recipe))}`;
        }

        function buildPublishedContentSignature(recipe) {
            const normalizedDiet = [...new Set((recipe.diet || []).filter(Boolean))].sort((left, right) => left.localeCompare(right));
            const normalizedInstructions = normalizeRecipeInstructions(recipe.instructions);

            return JSON.stringify({
                title: recipe.title || '',
                author: recipe.author || '',
                category: recipe.category || '',
                country: recipe.country || '',
                profile: recipe.profile || '',
                prepTime: Number(recipe.prepTime) || 0,
                cookTime: Number(recipe.cookTime) || 0,
                servings: Number(recipe.servings) || 0,
                difficulty: recipe.difficulty || '',
                diet: normalizedDiet,
                cuisine: recipe.cuisine || '',
                ingredients: [...(recipe.ingredients || [])],
                instructions: normalizedInstructions,
                tips: recipe.tips || ''
            });
        }

        function hasRecipeChangesSincePublish(recipe) {
            if (!recipe?.publishedId) return false;
            return buildPublishedContentSignature(recipe) !== (recipe.publishedContentSignature || '');
        }

        function isRecipePublishedLive(recipe) {
            return Boolean(recipe?.publishedId) && recipe.publicationState !== 'retracted';
        }

        function getPublishActionLabel(recipe) {
            if (!recipe?.publishedId) return 'Publish';
            if (isRecipePublishedLive(recipe)) return hasRecipeChangesSincePublish(recipe) ? 'Update publish' : 'Published live';
            return hasRecipeChangesSincePublish(recipe) ? 'Republish update' : 'Republish';
        }

        function getLocalRecipeByPublishedId(publishedRecipeId) {
            return recipes.find(recipe => recipe.source !== 'published' && recipe.publishedId === publishedRecipeId) || null;
        }

        function getPublishedRecipeFromCache(publishedRecipeId) {
            return publishedRecipesCache.find(recipe => recipe.id === publishedRecipeId) || null;
        }

        function isSavedPublishedRecipeOutdated(recipe) {
            if (!recipe || recipe.source !== 'published' || !recipe.publishedId) return false;

            const latestPublishedRecipe = getPublishedRecipeFromCache(recipe.publishedId);
            if (!latestPublishedRecipe || latestPublishedRecipe.publicationState === 'retracted') return false;

            return getPublishedVersionCode(latestPublishedRecipe) > getPublishedVersionCode(recipe);
        }

        function upsertPublishedRecipeCacheEntry(publishedRecipe) {
            if (!publishedRecipe?.id) return;

            const existingIndex = publishedRecipesCache.findIndex(recipe => recipe.id === publishedRecipe.id);
            if (existingIndex === -1) {
                publishedRecipesCache.push(publishedRecipe);
                return;
            }

            publishedRecipesCache[existingIndex] = publishedRecipe;
        }

        function buildPublishedRecipePayload(recipe, signature, versionCode) {
            return {
                title: recipe.title || '',
                author: recipe.author || 'Unknown',
                source: 'published',
                category: recipe.category || '',
                country: recipe.country || '',
                profile: recipe.profile || defaultPlaceholderProfile,
                prepTime: Number(recipe.prepTime) || 0,
                cookTime: Number(recipe.cookTime) || 0,
                servings: Number(recipe.servings) || 4,
                difficulty: recipe.difficulty || '',
                diet: [...(recipe.diet || [])],
                cuisine: recipe.cuisine || '',
                ingredients: [...(recipe.ingredients || [])],
                instructions: normalizeRecipeInstructions(recipe.instructions),
                tips: recipe.tips || '',
                authorEmail: currentUser?.email || userSettings.email || '',
                authorName: currentUser?.displayName || recipe.author || userSettings.name || 'Chef',
                authorId: currentUser?.uid || '',
                updatedAt: new Date(),
                likes: Array.isArray(recipe.likes) ? [...recipe.likes] : [],
                publicationState: 'live',
                publishedVersionCode: versionCode,
                publishedVersion: formatPublishedVersion(versionCode),
                publishedContentSignature: signature
            };
        }

        async function publishRecipe(recipeId) { if(!userSettings.premium) { showPremiumModal("publish recipes"); return; }
            if (!isAuthenticated || !firebaseInitialized || !currentUser) {
                showToast('Sign in to publish recipes', 'alert-circle');
                return false;
            }

            try {
                const recipe = recipes.find(r => r.id === recipeId);
                if (!recipe) return false;
                if (recipe.source === 'published' && !isPublishedRecipeOwnedByCurrentUser(recipe)) {
                    showToast('Only the original author can republish this community recipe.', 'alert-circle');
                    return false;
                }

                const db = firebase.firestore();
                let existingPublishedRecipe = null;
                let docRef = recipe.publishedId
                    ? db.collection('published-recipes').doc(recipe.publishedId)
                    : db.collection('published-recipes').doc();

                if (recipe.publishedId) {
                    const docSnapshot = await docRef.get();
                    if (docSnapshot.exists) {
                        existingPublishedRecipe = { ...docSnapshot.data(), id: docSnapshot.id };
                        if (!isPublishedRecipeOwnedByCurrentUser(existingPublishedRecipe)) {
                            showToast('Only the original author can update this published recipe.', 'alert-circle');
                            return false;
                        }
                    }
                }

                const signature = buildPublishedContentSignature(recipe);
                const previousSignature = existingPublishedRecipe?.publishedContentSignature || recipe.publishedContentSignature || signature;
                const isFirstPublish = !recipe.publishedId;
                const wasRetracted = !isFirstPublish && !isRecipePublishedLive(existingPublishedRecipe || recipe);
                const hasContentChanges = signature !== previousSignature;
                let versionCode = isFirstPublish ? initialPublishedVersionCode : getPublishedVersionCode(existingPublishedRecipe || recipe);

                if (!isFirstPublish && hasContentChanges) {
                    versionCode += 1;
                }

                const publishedAt = existingPublishedRecipe?.publishedAt || recipe.publishedAt || new Date();
                const payload = buildPublishedRecipePayload(recipe, signature, versionCode);

                await docRef.set({
                    ...payload,
                    publishedAt,
                    retractedAt: null
                }, { merge: true });

                recipe.publishedId = docRef.id;
                recipe.publishedAt = publishedAt;
                recipe.publishedVersionCode = versionCode;
                recipe.publishedVersion = formatPublishedVersion(versionCode);
                recipe.publishedContentSignature = signature;
                recipe.publicationState = 'live';
                saveData();

                upsertPublishedRecipeCacheEntry({
                    ...payload,
                    id: docRef.id,
                    publishedAt,
                    retractedAt: null
                });

                const versionLabel = `v${formatPublishedVersion(versionCode)}`;
                if (isFirstPublish) {
                    showToast(`Recipe published to Browse as ${versionLabel}`, 'check-circle');
                } else if (wasRetracted) {
                    showToast(`Recipe is back in Browse as ${versionLabel}`, 'check-circle');
                } else if (hasContentChanges) {
                    showToast(`Published update live as ${versionLabel}`, 'check-circle');
                } else {
                    showToast(`Recipe is already live as ${versionLabel}`, 'check-circle');
                }

                return true;
            } catch (error) {
                showToast(`Publish error: ${error.message}`, 'alert-circle');
                return false;
            }
        }

        async function unpublishRecipe(recipeId) {
            if (!isAuthenticated || !firebaseInitialized || !currentUser) {
                showToast('Sign in to retract published recipes', 'alert-circle');
                return false;
            }

            try {
                const recipe = recipes.find(r => r.id === recipeId);
                if (!recipe?.publishedId) {
                    showToast('This recipe is not live in Browse right now.', 'alert-circle');
                    return false;
                }

                const db = firebase.firestore();
                const docRef = db.collection('published-recipes').doc(recipe.publishedId);
                const docSnapshot = await docRef.get();
                const existingPublishedRecipe = docSnapshot.exists ? { ...docSnapshot.data(), id: docSnapshot.id } : null;

                if (existingPublishedRecipe && !isPublishedRecipeOwnedByCurrentUser(existingPublishedRecipe)) {
                    showToast('Only the original author can retract this recipe.', 'alert-circle');
                    return false;
                }

                const updatedAt = new Date();
                await docRef.set({
                    publicationState: 'retracted',
                    retractedAt: updatedAt,
                    updatedAt
                }, { merge: true });

                recipe.publicationState = 'retracted';
                saveData();

                upsertPublishedRecipeCacheEntry({
                    ...(existingPublishedRecipe || {}),
                    id: recipe.publishedId,
                    publicationState: 'retracted',
                    retractedAt: updatedAt,
                    updatedAt
                });

                showToast('Recipe removed from Browse. Saved copies stay with other cooks.', 'cloud-off');
                return true;
            } catch (error) {
                showToast(`Unpublish error: ${error.message}`, 'alert-circle');
                return false;
            }
        }

        async function loadPublishedRecipes() {
            if (!firebaseInitialized) return [];

            try {
                const db = firebase.firestore();
                const snapshot = await db.collection('published-recipes').orderBy('publishedAt', 'desc').limit(50).get();
                publishedRecipesCache = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                hasLoadedPublishedRecipesCache = true;
                return publishedRecipesCache.filter(recipe => recipe.publicationState !== 'retracted');
            } catch (error) {
                console.error('Error loading published recipes:', error);
                return [];
            }
        }

        async function refreshPublishedRecipeById(publishedRecipeId) {
            if (!firebaseInitialized || !publishedRecipeId) return null;

            try {
                const db = firebase.firestore();
                const docSnapshot = await db.collection('published-recipes').doc(publishedRecipeId).get();
                if (!docSnapshot.exists) return null;

                const publishedRecipe = { ...docSnapshot.data(), id: docSnapshot.id };
                upsertPublishedRecipeCacheEntry(publishedRecipe);
                return publishedRecipe;
            } catch (error) {
                console.error('Error refreshing published recipe:', error);
                return null;
            }
        }

        function ensurePublishedRecipesCacheLoaded() {
            if (!firebaseInitialized || hasLoadedPublishedRecipesCache || isLoadingPublishedRecipesCache) return;
            if (!recipes.some(recipe => recipe.source === 'published' && recipe.publishedId)) return;

            isLoadingPublishedRecipesCache = true;
            loadPublishedRecipes()
                .catch(() => [])
                .finally(() => {
                    isLoadingPublishedRecipesCache = false;
                    if (currentView === 'index') renderList();
                });
        }

        function queuePublishedRecipeStatusRefresh(localRecipeId, publishedRecipeId) {
            if (!firebaseInitialized || !publishedRecipeId) return;

            const now = Date.now();
            const lastCheckedAt = publishedRecipeStatusChecks[publishedRecipeId] || 0;
            if (now - lastCheckedAt < 120000) return;

            publishedRecipeStatusChecks[publishedRecipeId] = now;
            refreshPublishedRecipeById(publishedRecipeId).then(() => {
                if (currentView === 'index' && recipes.some(recipe => recipe.id === localRecipeId)) {
                    renderDetail(localRecipeId);
                }
            });
        }

        function isPublishedRecipeOwnedByCurrentUser(recipe) {
            if (!recipe) return false;
            if (currentUser?.uid && recipe.authorId) return recipe.authorId === currentUser.uid;
            if (userSettings.email && recipe.authorEmail) return recipe.authorEmail === userSettings.email;
            return false;
        }

        function isRecipeOwnedByCurrentUser(recipe) {
            if (!recipe) return false;
            if (recipe.source === 'published') return isPublishedRecipeOwnedByCurrentUser(recipe);
            return true;
        }

        function isRecipeEditable(recipe) {
            return Boolean(recipe && recipe.source === 'local');
        }

        function isRecipeAlwaysFavorite(recipe) {
            return Boolean(recipe && recipe.source === 'local');
        }

        function isRecipeFavorited(recipe) {
            if (!recipe) return false;
            return isRecipeAlwaysFavorite(recipe) || Boolean(userSettings.favorites?.includes(recipe.id));
        }

        function canRateRecipe(recipe) {
            return Boolean(recipe) && !isRecipeOwnedByCurrentUser(recipe);
        }

        function renderDetailIconAction(label, iconName, onClick, buttonClasses) {
            const safeLabel = escapeHTML(label);
            return `
                <div class="relative group flex flex-col items-center gap-2" translate="no">
                    <button onclick="${onClick}" aria-label="${safeLabel}" title="${safeLabel}" class="inline-flex h-12 w-12 items-center justify-center rounded-xl border ${buttonClasses} shadow-sm transition-all hover:-translate-y-0.5">
                        <i data-lucide="${iconName}" class="h-5 w-5"></i>
                    </button>
                    <span class="pointer-events-none absolute -top-10 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-forest px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white opacity-0 shadow-md transition-all group-hover:-translate-y-1 group-hover:opacity-100 md:block">${safeLabel}</span>
                    <span class="text-[10px] font-bold uppercase tracking-[0.16em] text-sage md:hidden">${safeLabel}</span>
                </div>
            `;
        }

        function toggleSavedRecipeUpdateNotice(recipeId) {
            activeSavedRecipeUpdateNoticeId = activeSavedRecipeUpdateNoticeId === recipeId ? null : recipeId;
            renderDetail(recipeId);
        }

        function isPublishedRecipeSaved(publishedRecipeId) {
            return recipes.some(recipe => recipe.source === 'published' && recipe.publishedId === publishedRecipeId);
        }

        function toggleSavedPublishedRecipe(publishedRecipeId, returnView = 'browse') {
            const existingIndex = recipes.findIndex(recipe => recipe.source === 'published' && recipe.publishedId === publishedRecipeId);

            if (existingIndex !== -1) {
                const removedRecipe = recipes[existingIndex];
                recipes.splice(existingIndex, 1);
                userSettings.favorites = (userSettings.favorites || []).filter(id => id !== removedRecipe.id);
                saveData();
                showToast('Removed from your Index', 'heart-off');
                if (returnView === 'detail') renderPublishedRecipeDetail(publishedRecipeId);
                else renderBrowse();
                return;
            }

            const publishedRecipe = publishedRecipesCache.find(recipe => recipe.id === publishedRecipeId);
            if (!publishedRecipe) return;

            recipes.unshift({
                ...publishedRecipe,
                id: generateId(),
                source: 'published',
                publishedId: publishedRecipe.id,
                author: publishedRecipe.authorName || publishedRecipe.author || 'Chef',
                profile: publishedRecipe.profile || defaultPlaceholderProfile,
                ingredients: [...(publishedRecipe.ingredients || [])],
                instructions: normalizeRecipeInstructions(publishedRecipe.instructions),
                diet: [...(publishedRecipe.diet || [])],
                publishedVersionCode: getPublishedVersionCode(publishedRecipe),
                publishedVersion: formatPublishedVersion(getPublishedVersionCode(publishedRecipe)),
                publishedContentSignature: publishedRecipe.publishedContentSignature || buildPublishedContentSignature(publishedRecipe),
                publicationState: publishedRecipe.publicationState || 'live',
                checkedIngredients: [],
                checkedSteps: [],
                personalNotes: '',
                lastOpened: Date.now()
            });

            saveData();
            showToast('Saved to your Index', 'heart');
            if (returnView === 'detail') renderPublishedRecipeDetail(publishedRecipeId);
            else renderBrowse();
        }

        function exportAllAsJSON() {
            const backup = {
                settings: userSettings,
                recipes,
                exportDate: new Date().toISOString()
            };

            const dataStr = JSON.stringify(backup, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `recipe-archive-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
            showToast('Backup downloaded!', 'download');
        }

        function importFromJSON(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const backup = JSON.parse(event.target.result);
                    if (backup.settings && backup.recipes) {
                        userSettings = { ...userSettings, ...backup.settings };
                        recipes = backup.recipes;
                        saveData();
                        showToast('Backup restored successfully!', 'check-circle');
                        renderList();
                        e.target.value = '';
                    } else {
                        showToast('Invalid backup file format', 'alert-circle');
                    }
                } catch (err) {
                    showToast('Error restoring backup', 'x-circle');
                    console.error(err);
                }
            };
            reader.readAsText(file);
        }

        function exportRecipeAsPDF(recipeId) {
            const recipe = recipes.find(r => r.id === recipeId);
            if (!recipe) return;

            const htmlContent = `
                <div style="font-family: 'Cormorant Garamond', serif; padding: 40px; max-width: 800px; color: #2C3D2E;">
                    <h1 style="font-size: 36px; margin-bottom: 10px; font-weight: bold;">${recipe.title}</h1>
                    <p style="color: #7A8B76; font-size: 14px; margin-bottom: 20px;">By ${recipe.author} â€¢ ${recipe.country || 'Unknown'}</p>

                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; padding: 15px; background-color: #F4EFE6; border-radius: 8px;">
                        ${recipe.prepTime ? `<div style="text-align: center;"><strong>${recipe.prepTime}m</strong><br><span style="font-size: 12px; color: #7A8B76;">Prep</span></div>` : ''}
                        ${recipe.cookTime ? `<div style="text-align: center;"><strong>${recipe.cookTime}m</strong><br><span style="font-size: 12px; color: #7A8B76;">Cook</span></div>` : ''}
                        ${recipe.servings ? `<div style="text-align: center;"><strong>${recipe.servings}</strong><br><span style="font-size: 12px; color: #7A8B76;">Servings</span></div>` : ''}
                        ${recipe.difficulty ? `<div style="text-align: center;"><strong>${recipe.difficulty}</strong><br><span style="font-size: 12px; color: #7A8B76;">Difficulty</span></div>` : ''}
                    </div>

                    <h2 style="font-size: 24px; margin-top: 25px; margin-bottom: 15px; font-weight: bold; border-bottom: 2px solid #C5A059; padding-bottom: 10px;">Ingredients</h2>
                    <ul style="list-style: none; padding: 0;">
                        ${(recipe.ingredients || []).map(ing => `<li style="padding: 8px 0; border-bottom: 1px solid #EFEFEF;">â€¢ ${applyMeasurementSystem(ing)}</li>`).join('')}
                    </ul>

                    <h2 style="font-size: 24px; margin-top: 25px; margin-bottom: 15px; font-weight: bold; border-bottom: 2px solid #C5A059; padding-bottom: 10px;">Instructions</h2>
                    <ol style="padding-left: 20px;">
                        ${(recipe.instructions || []).map(step => `<li style="padding: 10px 0; line-height: 1.6;">${applyMeasurementSystem(getRecipeInstructionText(step))}</li>`).join('')}
                    </ol>

                    ${recipe.tips ? `
                    <h2 style="font-size: 24px; margin-top: 25px; margin-bottom: 15px; font-weight: bold; border-bottom: 2px solid #C5A059; padding-bottom: 10px;">Chef's Notes</h2>
                    <p style="line-height: 1.6;">${applyMeasurementSystem(recipe.tips)}</p>
                    ` : ''}

                    ${recipe.personalNotes ? `
                    <h2 style="font-size: 24px; margin-top: 25px; margin-bottom: 15px; font-weight: bold; border-bottom: 2px solid #C5A059; padding-bottom: 10px;">Your Notes</h2>
                    <p style="line-height: 1.6;">${applyMeasurementSystem(recipe.personalNotes)}</p>
                    ` : ''}
                </div>
            `;

            const element = document.createElement('div');
            element.innerHTML = htmlContent;

            const opt = {
                margin: 10,
                filename: `${recipe.title}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
            };

            html2pdf().set(opt).from(element).save();
            showToast('PDF downloaded!', 'download');
        }

        const contentDiv = document.getElementById('app-content');
        const toastEl = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        let currentView = 'index';

        function setActiveNav(view) {
            currentView = view;
            document.querySelectorAll('[data-nav-view]').forEach(button => {
                const isActive = button.dataset.navView === view;
                button.classList.toggle('bg-accent', isActive);
                button.classList.toggle('bg-opacity-40', isActive);
                button.classList.toggle('text-forest', isActive);
                button.classList.toggle('shadow-sm', isActive);
                button.classList.toggle('hover:text-gold', !isActive);
            });
        }

        function showToast(message, iconName = 'check-circle') {
            document.getElementById('toast-icon').setAttribute('data-lucide', iconName);
            toastMessage.textContent = message;
            lucide.createIcons();
            toastEl.classList.remove('opacity-0', '-translate-y-4');
            setTimeout(() => toastEl.classList.add('opacity-0', '-translate-y-4'), 3000);
        }

        function generateId() { return recipes.length > 0 ? Math.max(...recipes.map(r => r.id)) + 1 : 1; }

        function toggleCookingMode(recipeId = null) {
            isCookingMode = !isCookingMode;
            document.getElementById('body').classList.toggle('cooking-mode-active');
            const btnText = document.getElementById('focus-btn-text');
            const btnIcon = document.getElementById('focus-btn-icon');
            
            if(isCookingMode) {
                showToast('Cooking mode on. Follow the next unfinished step.', 'chef-hat');
                if(btnText) btnText.textContent = "Exit Cooking";
                if(btnIcon) btnIcon.setAttribute('data-lucide', 'x-circle');

                if (recipeId) {
                    const recipe = recipes.find(r => r.id === recipeId);
                    const nextStepIndex = recipe ? (recipe.instructions || []).findIndex((_, index) => !(recipe.checkedSteps || []).includes(index)) : -1;
                    const targetIndex = nextStepIndex === -1 ? 0 : nextStepIndex;
                    const targetStep = document.querySelector(`.recipe-step-${recipeId}[data-step-index="${targetIndex}"]`);

                    if (targetStep) {
                        targetStep.classList.add('cooking-step-highlight');
                        targetStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        window.setTimeout(() => targetStep.classList.remove('cooking-step-highlight'), 1800);
                    }
                }
            } else {
                showToast('Back to Archive', 'layout-template');
                if(btnText) btnText.textContent = "Start Cooking";
                if(btnIcon) btnIcon.setAttribute('data-lucide', 'chef-hat');
            }
            lucide.createIcons();
        }

        function cancelRecipeEditor() {
            const recipeId = editingRecipeId;
            editingRecipeId = null;

            if (recipeId) {
                renderDetail(recipeId);
            } else {
                renderList();
            }

            contentDiv.scrollTop = 0;
        }

        function handleImageUpload(event, targetElementId, targetVarName, isUserSetting = false) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const base64 = e.target.result;
                    document.getElementById(targetElementId).style.backgroundImage = `url(${base64})`;
                    document.getElementById(targetElementId).innerHTML = ''; 
                    if(isUserSetting) userSettings[targetVarName] = base64;
                    else window[targetVarName] = base64;
                }
                reader.readAsDataURL(file);
            }
        }

        function check12HourReset(recipe) {
            const now = Date.now();
            if (recipe.lastOpened && (now - recipe.lastOpened > 12 * 60 * 60 * 1000)) {
                recipe.checkedIngredients = [];
                recipe.checkedSteps = [];
            }
            recipe.lastOpened = now;
            saveData();
        }

        function toggleItemCheck(recipeId, type, index, element) {
            const recipe = recipes.find(r => r.id === recipeId);
            if (!recipe) return;
            if(!recipe.checkedIngredients) recipe.checkedIngredients = [];
            if(!recipe.checkedSteps) recipe.checkedSteps = [];

            const arr = type === 'ingredient' ? recipe.checkedIngredients : recipe.checkedSteps;
            const pos = arr.indexOf(index);
            if (pos === -1) arr.push(index);
            else arr.splice(pos, 1);

            saveData();
            element.classList.toggle('line-through');
            element.classList.toggle('opacity-40');
            const icon = element.querySelector('.check-icon');
            if (element.classList.contains('line-through')) icon.classList.remove('opacity-0');
            else icon.classList.add('opacity-0');
        }

        // --- VIEWS ---
        function renderProfile() {
            isCookingMode = false;
            document.getElementById('body').classList.remove('cooking-mode-active');
            setActiveNav('profile');

            const bannerBg = userSettings.bannerPic || defaultPlaceholderBanner;
            const profileBg = userSettings.profilePic || defaultPlaceholderProfile;
            const createdRecipes = recipes.filter(recipe => recipe.source !== 'published').length;
            const savedRecipes = recipes.filter(recipe => recipe.source === 'published').length;
            const publishedRecipes = recipes.filter(recipe => recipe.source !== 'published' && isRecipePublishedLive(recipe)).length;

            contentDiv.innerHTML = `
                <div class="max-w-4xl mx-auto space-y-6">
                    <div class="bg-white rounded-sm shadow-sm border border-parchmentDark overflow-hidden">
                        <div class="h-44 bg-cover bg-center relative" style="background-image: url('${bannerBg}')">
                            <div class="absolute inset-0 bg-gradient-to-t from-forest/60 to-transparent"></div>
                        </div>
                        <div class="px-6 md:px-8 pb-8">
                            <div class="flex flex-col md:flex-row md:items-end gap-5 -mt-12 relative z-10">
                                <div class="w-24 h-24 rounded-full border-4 border-white shadow-xl bg-cover bg-center bg-white" style="background-image: url('${profileBg}')"></div>
                                <div class="pt-2">
                                    <h2 class="font-fantasy font-bold text-4xl text-forest">${userSettings.name || 'Your Profile'}</h2>
                                    <p class="text-sm font-bold uppercase tracking-[0.24em] text-sage mt-1">${userSettings.country || 'Set your country'}</p>
                                    <p class="mt-3 text-sm font-semibold text-forest opacity-80 max-w-2xl">${userSettings.bio || 'Add a short bio.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-white rounded-sm border border-parchmentDark p-5 shadow-sm">
                            <p class="text-xs font-bold uppercase tracking-[0.24em] text-sage">Created</p>
                            <p class="mt-2 text-3xl font-fantasy font-bold text-forest">${createdRecipes}</p>
                            <p class="text-sm font-semibold text-sage">Your recipes</p>
                        </div>
                        <div class="bg-white rounded-sm border border-parchmentDark p-5 shadow-sm">
                            <p class="text-xs font-bold uppercase tracking-[0.24em] text-sage">Saved</p>
                            <p class="mt-2 text-3xl font-fantasy font-bold text-forest">${savedRecipes}</p>
                            <p class="text-sm font-semibold text-sage">Saved from Browse</p>
                        </div>
                        <div class="bg-white rounded-sm border border-parchmentDark p-5 shadow-sm">
                            <p class="text-xs font-bold uppercase tracking-[0.24em] text-sage">Published</p>
                            <p class="mt-2 text-3xl font-fantasy font-bold text-forest">${publishedRecipes}</p>
                            <p class="text-sm font-semibold text-sage">Shared live</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.9fr)]">
                        <div class="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-parchmentDark lg:col-span-2">
                            <div class="flex flex-col gap-4 border-b border-accent pb-5 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h3 class="mt-2 font-fantasy font-bold text-3xl text-forest flex items-center gap-2">
                                        <i data-lucide="user-round" class="w-7 h-7 text-gold"></i> Profile details
                                    </h3>
                                </div>
                                <button onclick="renderProfileEditor()" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-parchmentDark bg-white px-4 text-xs font-bold uppercase tracking-[0.2em] text-forest shadow-sm transition-all hover:border-gold hover:text-sage">
                                    <i data-lucide="pencil-line" class="h-4 w-4 text-gold"></i>Edit profile
                                </button>
                            </div>

                            <div class="grid grid-cols-1 gap-5 pt-6 md:grid-cols-2">
                                <div class="rounded-md border border-parchmentDark bg-parchment p-4">
                                    <p class="text-[11px] font-bold uppercase tracking-[0.24em] text-sage">Name</p>
                                    <p class="mt-2 text-lg font-bold text-forest">${userSettings.name || 'Not set yet'}</p>
                                </div>
                                <div class="rounded-md border border-parchmentDark bg-parchment p-4">
                                    <p class="text-[11px] font-bold uppercase tracking-[0.24em] text-sage">Country</p>
                                    <p class="mt-2 text-lg font-bold text-forest">${userSettings.country || 'Not set yet'}</p>
                                </div>
                                <div class="rounded-md border border-parchmentDark bg-parchment p-4 md:col-span-2">
                                    <p class="text-[11px] font-bold uppercase tracking-[0.24em] text-sage">Bio</p>
                                    <p class="mt-2 text-sm font-semibold leading-relaxed text-forest opacity-85">${userSettings.bio || 'Add a short bio.'}</p>
                                </div>
                                <div class="rounded-md border border-parchmentDark bg-parchment p-4">
                                    <p class="text-[11px] font-bold uppercase tracking-[0.24em] text-sage">Visibility</p>
                                    <p class="mt-2 text-lg font-bold text-forest">${userSettings.isPublic ? 'Public' : 'Private'}</p>
                                </div>
                                <div class="rounded-md border border-parchmentDark bg-parchment p-4">
                                    <p class="text-[11px] font-bold uppercase tracking-[0.24em] text-sage">Email</p>
                                    <p class="mt-2 text-sm font-semibold text-forest break-all">${userSettings.email || 'Sign in to sync your profile'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- New My Families Section -->
                    <div class="bg-white rounded-sm shadow-sm border border-parchmentDark p-6 md:p-8">
                        <div class="flex items-center justify-between mb-6">
                            <div>
                                <h3 class="font-serif text-2xl font-bold text-forest">My Families</h3>
                                <p class="text-sm text-sage mt-1">Collaborate on recipe books (Max 3)</p>
                            </div>
                            <div class="flex gap-3">
                                <button onclick="showJoinFamilyModal()" class="bg-parchment border border-parchmentDark text-forest hover:bg-parchmentDark px-4 py-2 rounded-sm text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2 uppercase tracking-wider">
                                    <i data-lucide="log-in" class="w-4 h-4"></i> Join
                                </button>
                                <button onclick="showCreateFamilyModal()" class="bg-forest text-white hover:bg-sage px-4 py-2 rounded-sm text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2 uppercase tracking-wider">
                                    <i data-lucide="plus" class="w-4 h-4"></i> Create
                                </button>
                            </div>
                        </div>
                        
                        ${userFamilies && userFamilies.length > 0 ? `
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                ${userFamilies.map(family => {
                                    const isRemoved = family.removedMembers && family.removedMembers.some(m => m.userId === currentUser?.uid);
                                    return `
                                        <div onclick="showFamilyDetails('${family.id}')" class="border border-parchmentDark rounded-md p-4 cursor-pointer hover:bg-parchment transition-colors relative ${isRemoved ? 'opacity-70' : ''}">
                                            <div class="flex items-center justify-between mb-2">
                                                <div class="flex items-center gap-2">
                                                    <h4 class="font-bold text-lg text-forest">${family.name}</h4>
                                                    <span class="text-[10px] px-2 py-0.5 bg-parchmentDark text-sage rounded-full font-bold">#${family.tag}</span>
                                                </div>
                                                ${isRemoved ? `<span class="text-[10px] uppercase font-bold text-coral bg-coral/10 outline outline-1 outline-coral/20 px-2 py-1 rounded-sm">Read-only</span>` : ''}
                                            </div>
                                            <div class="flex items-center gap-4 text-sm text-sage">
                                                <span class="flex items-center gap-1"><i data-lucide="users" class="w-4 h-4"></i> ${family.memberIds ? family.memberIds.length : 0} members</span>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : `
                            <div class="text-center py-10 border-2 border-dashed border-parchmentDark rounded-md bg-parchment">
                                <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-parchmentDark">
                                    <i data-lucide="users" class="text-sage w-6 h-6"></i>
                                </div>
                                <p class="text-forest font-bold mb-1">No families yet</p>
                                <p class="text-sage text-sm">Create or join a family to start collaborating.</p>
                            </div>
                        `}
                    </div>

                </div>
            `;
            lucide.createIcons();
        }

        function renderProfileEditor() {
            isCookingMode = false;
            document.getElementById('body').classList.remove('cooking-mode-active');
            setActiveNav('profile');

            const bannerBg = userSettings.bannerPic || defaultPlaceholderBanner;
            const profileBg = userSettings.profilePic || defaultPlaceholderProfile;
            const createdRecipes = recipes.filter(recipe => recipe.source !== 'published').length;
            const savedRecipes = recipes.filter(recipe => recipe.source === 'published').length;
            const publishedRecipes = recipes.filter(recipe => recipe.source !== 'published' && isRecipePublishedLive(recipe)).length;

            contentDiv.innerHTML = `
                <div class="max-w-4xl mx-auto space-y-6">
                    <div class="bg-white rounded-sm shadow-sm border border-parchmentDark overflow-hidden">
                        <div class="h-44 bg-cover bg-center relative" style="background-image: url('${bannerBg}')">
                            <div class="absolute inset-0 bg-gradient-to-t from-forest/60 to-transparent"></div>
                        </div>
                        <div class="px-6 md:px-8 pb-8">
                            <div class="flex flex-col md:flex-row md:items-end gap-5 -mt-12 relative z-10">
                                <div class="w-24 h-24 rounded-full border-4 border-white shadow-xl bg-cover bg-center bg-white" style="background-image: url('${profileBg}')"></div>
                                <div class="pt-2">
                                    <p class="text-[11px] font-bold uppercase tracking-[0.32em] text-sage opacity-80">Profile editor</p>
                                    <h2 class="font-fantasy font-bold text-4xl text-forest">Edit your profile details</h2>
                                    <p class="mt-3 text-sm font-semibold text-forest opacity-80 max-w-2xl">Update your banner, avatar, bio, and visibility here, then return to the clean summary card.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-white rounded-sm border border-parchmentDark p-5 shadow-sm">
                            <p class="text-xs font-bold uppercase tracking-[0.24em] text-sage">Created</p>
                            <p class="mt-2 text-3xl font-fantasy font-bold text-forest">${createdRecipes}</p>
                            <p class="text-sm font-semibold text-sage">Recipes you authored</p>
                        </div>
                        <div class="bg-white rounded-sm border border-parchmentDark p-5 shadow-sm">
                            <p class="text-xs font-bold uppercase tracking-[0.24em] text-sage">Saved</p>
                            <p class="mt-2 text-3xl font-fantasy font-bold text-forest">${savedRecipes}</p>
                            <p class="text-sm font-semibold text-sage">Recipes liked from Browse</p>
                        </div>
                        <div class="bg-white rounded-sm border border-parchmentDark p-5 shadow-sm">
                            <p class="text-xs font-bold uppercase tracking-[0.24em] text-sage">Published</p>
                            <p class="mt-2 text-3xl font-fantasy font-bold text-forest">${publishedRecipes}</p>
                            <p class="text-sm font-semibold text-sage">Live community recipes</p>
                        </div>
                    </div>

                    <div class="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-parchmentDark">
                        <div class="mb-6 flex flex-col gap-4 border-b border-accent pb-4 md:flex-row md:items-center md:justify-between">
                            <h3 class="font-fantasy font-bold text-3xl text-forest flex items-center gap-2">
                                <i data-lucide="user-round-cog" class="w-7 h-7 text-gold"></i> Profile Details
                            </h3>
                            <button type="button" onclick="renderProfile()" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-parchmentDark bg-white px-4 text-xs font-bold uppercase tracking-[0.2em] text-sage shadow-sm transition-all hover:border-gold hover:text-forest">
                                <i data-lucide="arrow-left" class="h-4 w-4"></i>Back to profile
                            </button>
                        </div>

                        <form onsubmit="saveProfile(event)" class="space-y-6">
                            <div class="mb-10 relative">
                                <label class="custom-file-upload w-full block mb-2">
                                    <span class="block text-xs uppercase tracking-wide font-bold text-sage mb-2">Profile Banner</span>
                                    <input type="file" accept="image/*" onchange="handleImageUpload(event, 'profile-banner-preview', 'bannerPic', true)">
                                    <div id="profile-banner-preview" class="w-full h-36 rounded-sm bg-cover bg-center border border-parchmentDark flex items-center justify-center group" style="background-image: url('${bannerBg}')">
                                        <div class="bg-white bg-opacity-80 px-3 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-xs font-bold text-forest">
                                            <i data-lucide="upload" class="w-4 h-4"></i> Change Banner
                                        </div>
                                    </div>
                                </label>

                                <label class="custom-file-upload absolute -bottom-8 left-6 z-10 block">
                                    <input type="file" accept="image/*" onchange="handleImageUpload(event, 'profile-avatar-preview', 'profilePic', true)">
                                    <div id="profile-avatar-preview" class="w-24 h-24 rounded-full bg-cover bg-center border-4 border-white shadow-md flex items-center justify-center group" style="background-image: url('${profileBg}')">
                                        <div class="bg-white bg-opacity-80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><i data-lucide="camera" class="w-5 h-5 text-forest"></i></div>
                                    </div>
                                </label>
                            </div>

                            <div class="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-2">Chef Name</label>
                                    <input type="text" id="profile-name" value="${userSettings.name}" placeholder="Gordon Ramsay" class="${inputClass}">
                                </div>
                                <div>
                                    <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-2">Default Country</label>
                                    <input type="text" id="profile-country" value="${userSettings.country}" list="countries-list" placeholder="e.g. ðŸ‡®ðŸ‡¹ Italy" class="${inputClass}">
                                </div>
                            </div>

                            <div>
                                <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-2">Short Bio</label>
                                <textarea id="profile-bio" placeholder="Tell us about your cooking style..." class="${textareaClass}">${userSettings.bio}</textarea>
                            </div>

                            <div class="bg-accent bg-opacity-30 p-4 rounded-sm border border-sage border-opacity-20 flex justify-between items-center gap-4">
                                <div>
                                    <h4 class="font-bold text-forest flex items-center gap-2"><i data-lucide="globe" class="w-4 h-4 text-gold"></i> Public Profile</h4>
                                    <p class="text-xs text-sage mt-1 font-semibold">Allow other users to visit your profile.</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="profile-public" class="sr-only peer" ${userSettings.isPublic ? 'checked' : ''}>
                                    <div class="w-11 h-6 bg-parchmentDark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sage"></div>
                                </label>
                            </div>

                            <div class="pt-6 border-t border-accent mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <button type="button" onclick="renderProfile()" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-parchmentDark bg-white px-4 text-xs font-bold uppercase tracking-[0.2em] text-sage shadow-sm transition-all hover:border-gold hover:text-forest">
                                    <i data-lucide="arrow-left" class="h-4 w-4"></i>Cancel
                                </button>
                                <button type="submit" class="bg-forest text-white h-12 px-8 rounded-sm font-bold shadow-md hover:bg-sage transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-sm min-w-[150px]">
                                    <i data-lucide="save" class="w-4 h-4"></i> Save Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <datalist id="countries-list">${countriesList.map(c => `<option value="${c}"></option>`).join('')}</datalist>
            `;
            lucide.createIcons();
        }

        async function saveProfile(e) {
            e.preventDefault();
            userSettings.name = document.getElementById('profile-name').value;
            userSettings.country = document.getElementById('profile-country').value;
            userSettings.bio = document.getElementById('profile-bio').value;
            userSettings.isPublic = document.getElementById('profile-public').checked;
            saveData();
            await syncToFirestore();
            showToast('Profile saved successfully!', 'user-check');
            renderProfile();
        }

        function renderSettings() {
            isCookingMode = false;
            document.getElementById('body').classList.remove('cooking-mode-active');
            setActiveNav('settings');

            contentDiv.innerHTML = `
                <div class="max-w-4xl mx-auto space-y-6">
                    <div class="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-parchmentDark">
                        <h2 class="font-fantasy font-bold text-3xl mb-6 text-forest border-b border-accent pb-4 flex items-center gap-2">
                            <i data-lucide="settings-2" class="w-8 h-8 text-gold"></i> Settings
                        </h2>

                        <form onsubmit="saveSettings(event)" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-2">Measurement System</label>
                                    <select id="settings-measurement" class="${inputClass}">
                                        <option value="Metric" ${userSettings.measurementSystem === 'Metric' ? 'selected' : ''}>Metric (Grams, ML, Â°C)</option>
                                        <option value="Imperial" ${userSettings.measurementSystem === 'Imperial' ? 'selected' : ''}>Imperial (Ounces, Cups, Â°F)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-2">Display Language</label>
                                    <select id="settings-language" class="${inputClass}">
                                        <option value="en" ${userSettings.language === 'en' ? 'selected' : ''}>English (Original)</option>
                                        <option value="nl" ${userSettings.language === 'nl' ? 'selected' : ''}>Nederlands (Dutch)</option>
                                        <option value="es" ${userSettings.language === 'es' ? 'selected' : ''}>EspaÃ±ol (Spanish)</option>
                                        <option value="fr" ${userSettings.language === 'fr' ? 'selected' : ''}>FranÃ§ais (French)</option>
                                        <option value="de" ${userSettings.language === 'de' ? 'selected' : ''}>Deutsch (German)</option>
                                        <option value="it" ${userSettings.language === 'it' ? 'selected' : ''}>Italiano (Italian)</option>
                                    </select>
                                    <p class="text-[10px] text-sage mt-1 italic">Automatically translates the entire app.</p>
                                </div>
                                <div class="md:col-span-2">
                                    <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-2">Visual Mode</label>
                                    <div class="rounded-xl border border-sage border-opacity-20 bg-accent bg-opacity-60 p-4">
                                        <div class="flex items-start justify-between gap-4">
                                            <div>
                                                <p class="text-sm font-bold text-forest">Light mode only</p>
                                                <p class="mt-1 text-xs font-semibold text-sage">Dark mode is temporarily disabled while the new light-mode styling is being refined.</p>
                                            </div>
                                            <i data-lucide="sun-medium" class="w-5 h-5 text-gold"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="pt-4 border-t border-accent flex justify-end">
                                <button type="submit" class="bg-forest text-white h-12 px-8 rounded-sm font-bold shadow-md hover:bg-sage transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-sm min-w-[150px]">
                                    <i data-lucide="save" class="w-4 h-4"></i> Save Settings
                                </button>
                            </div>
                        </form>
                    </div>

                    <div class="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-parchmentDark">
                        <h3 class="font-fantasy font-bold text-3xl mb-6 text-forest border-b border-accent pb-4 flex items-center gap-2">
                            <i data-lucide="database" class="w-8 h-8 text-gold"></i> Backup & Restore
                        </h3>
                        <p class="text-sm text-sage mb-6 font-semibold">Keep your recipes safe by creating regular backups.</p>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button onclick="exportAllAsJSON()" class="bg-gold text-white h-12 px-8 rounded-sm font-bold shadow-md hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-sm">
                                <i data-lucide="download" class="w-4 h-4"></i> Download Backup
                            </button>

                            <label class="bg-forest text-white h-12 px-8 rounded-sm font-bold shadow-md hover:bg-sage transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-sm cursor-pointer">
                                <i data-lucide="upload" class="w-4 h-4"></i> Restore Backup
                                <input type="file" accept=".json" onchange="importFromJSON(event)" style="display: none;">
                            </label>
                        </div>
                        <p class="text-[10px] text-sage mt-4 italic">Backups contain all your recipes, favorites, ratings, and settings in JSON format.</p>
                    </div>

                    <div class="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-parchmentDark">
                        <h3 class="font-fantasy font-bold text-3xl mb-6 text-forest border-b border-accent pb-4 flex items-center gap-2">
                            <i data-lucide="cloud" class="w-8 h-8 text-gold"></i> Cloud Sync & Publishing
                        </h3>

                        <div class="space-y-4">
                            ${isAuthenticated ? `
                                <div class="bg-sage bg-opacity-10 p-4 rounded-sm border border-sage flex items-center gap-3">
                                    <i data-lucide="check-circle" class="w-6 h-6 text-forest"></i>
                                    <div>
                                        <p class="font-bold text-forest">Signed In</p>
                                        <p class="text-sm text-sage">${currentUser?.email || userSettings.email || 'Cloud Account'}</p>
                                    </div>
                                </div>
                                <button onclick="signOut()" class="w-full bg-red-500 text-white h-12 rounded-sm font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-sm">
                                    <i data-lucide="log-out" class="w-4 h-4"></i> Sign Out
                                </button>
                            ` : `
                                <p class="text-sm text-sage mb-4">Sign in to publish recipes, browse community recipes, and sync across devices.</p>
                                <button onclick="signInWithGoogle()" class="w-full bg-gold text-white h-12 rounded-sm font-bold hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-sm">
                                    <i data-lucide="lock" class="w-4 h-4"></i> Sign In with Google
                                </button>
                                <p class="text-[10px] text-sage italic mt-4">By signing in, you enable cloud syncing and community publishing features.</p>
                            `}
                        </div>
                    </div>
                    
                    <!-- App Info Section -->
                    <div class="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-parchmentDark">
                        <button onclick="showAppInfo()" class="bg-forest text-white h-12 px-8 rounded-sm font-bold shadow-md hover:bg-sage transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-sm w-full md:w-auto">
                            <i data-lucide="info" class="w-4 h-4"></i> App Info
                        </button>
                    </div>

                </div>
            `;
            lucide.createIcons();
        }

        function showAppInfo() {
            createModal('App Info & Family Recipe Books', `
                <div class="space-y-4 text-inkDark p-4 max-h-[70vh] overflow-y-auto w-[650px] max-w-[90vw]">
                    <h3 class="font-serif font-bold text-lg mb-2">Family Recipe Books</h3>
                    <p class="text-sm">Welcome to Family Recipe Books! You can create or join up to 3 families. Recipes shared with families become collaborative and are saved with a 5-step version history.</p>
                    <ul class="text-sm list-disc pl-5 space-y-1 my-2">
                        <li><strong>Rights:</strong> All active members can edit family recipes.</li>
                        <li><strong>Limit:</strong> Maximum 3 families per user.</li>
                        <li><strong>History:</strong> The last 5 edits of a recipe are saved automatically.</li>
                        <li><strong>If you are removed:</strong> You will get a 30-day grace period to view and download (PDF) your recipes, or duplicate them to your personal account. After that, you lose access!</li>
                    </ul>
                    <p class="text-sm font-bold text-coral">We highly encourage you to use the PDF export feature regularly to backup your favorite recipes!</p>
                </div>
            `, [{ text: 'Close', primary: true, onClick: () => closeModal() }]);
        }

        function saveSettings(e) {
            e.preventDefault();
            userSettings.measurementSystem = document.getElementById('settings-measurement').value;

            const newLang = document.getElementById('settings-language').value;
            userSettings.language = newLang;
            delete userSettings.themeMode;
            changeGlobalLanguage(newLang);

            saveData();
            showToast('Settings saved successfully!', 'settings-2');
            renderSettings();
        }

        function toggleDietFilterOption(value) {
            if (dietFilter.includes(value)) dietFilter = dietFilter.filter(item => item !== value);
            else dietFilter = [...dietFilter, value];
            renderList();
        }

        function toggleDietFiltersVisibility() {
            showDietFilters = !showDietFilters;
            if (!showDietFilters) showDietGuide = false;
            renderList();
        }

        function toggleDietGuide() {
            showDietGuide = !showDietGuide;
            renderList();
        }

        function getRecipeDietCoverage(recipe) {
            const coverage = new Set();
            (recipe?.diet || []).filter(Boolean).forEach(tag => {
                const supportedTag = dietOptions.find(option => option.toLowerCase() === String(tag).toLowerCase()) || tag;
                (dietCompatibilityMap[supportedTag] || [supportedTag]).forEach(mappedTag => coverage.add(mappedTag));
            });
            return coverage;
        }

        function doesRecipeMatchDietFilters(recipe) {
            if (dietFilter.length === 0) return true;
            const coverage = getRecipeDietCoverage(recipe);
            return dietFilter.every(selectedDiet => coverage.has(selectedDiet));
        }

        function resetRecipeFilters() {
            searchQuery = "";
            categoryFilter = "";
            difficultyFilter = "";
            dietFilter = [];
            showDietFilters = false;
            showDietGuide = false;
            cuisineFilter = "";
            collectionScopeFilter = 'all';
            showFavoritesOnly = false;
            renderList();
        }

        function normalizeCollectionScopeFilter(scope = collectionScopeFilter) {
            return ['mine', 'saved'].includes(scope) ? scope : 'all';
        }

        function getCollectionScopeLabel(scope = collectionScopeFilter) {
            switch (normalizeCollectionScopeFilter(scope)) {
                case 'mine':
                    return 'Mine';
                case 'saved':
                    return 'Saved';
                default:
                    return 'All recipes';
            }
        }

        function recipeNeedsAttention(recipe) {
            if (!recipe) return false;
            if (recipe.source === 'published') return isSavedPublishedRecipeOutdated(recipe);
            if (!recipe.publishedId) return false;
            return hasRecipeChangesSincePublish(recipe) || !isRecipePublishedLive(recipe);
        }

        function doesRecipeMatchCollectionScope(recipe) {
            switch (normalizeCollectionScopeFilter(collectionScopeFilter)) {
                case 'mine':
                    return recipe?.source !== 'published';
                case 'saved':
                    return recipe?.source === 'published';
                default:
                    return true;
            }
        }

        function toggleListSearchVisibility() {
            if (indexViewMode === 'book') {
                showListSearch = true;
                showListFilters = false;
                showDietFilters = false;
                showDietGuide = false;
                indexViewMode = 'cards';
                userSettings.indexViewMode = 'cards';
                notebookCoverOpen = false;
                saveData();
                renderList();
                contentDiv.scrollTop = 0;
                return;
            }

            const nextVisibility = !showListSearch;
            showListSearch = nextVisibility;
            if (nextVisibility) {
                showListFilters = false;
                showDietFilters = false;
                showDietGuide = false;
            }
            renderList();
        }

        function toggleListFiltersVisibility() {
            if (indexViewMode === 'book') {
                showListFilters = true;
                showListSearch = false;
                showDietFilters = false;
                showDietGuide = false;
                indexViewMode = 'cards';
                userSettings.indexViewMode = 'cards';
                notebookCoverOpen = false;
                saveData();
                renderList();
                contentDiv.scrollTop = 0;
                return;
            }

            const nextVisibility = !showListFilters;
            showListFilters = nextVisibility;
            if (nextVisibility) {
                showListSearch = false;
            } else {
                showDietFilters = false;
                showDietGuide = false;
            }
            renderList();
        }

        function setIndexViewMode(mode) {
            const nextMode = mode === 'book' ? 'book' : 'cards';
            const enteringBookMode = nextMode === 'book' && indexViewMode !== 'book';
            indexViewMode = nextMode;
            userSettings.indexViewMode = nextMode;
            if (enteringBookMode) notebookCoverOpen = false;
            if (nextMode === 'book') {
                showListSearch = false;
                showListFilters = false;
                showDietFilters = false;
                showDietGuide = false;
            }
            if (nextMode === 'book' && notebookPageIndex >= currentIndexRecipeIds.length) {
                notebookPageIndex = 0;
            }
            saveData();
            renderList();
            contentDiv.scrollTop = 0;
        }

        function openNotebookCover(skipAnimate = false) {
            activeNotebookStickyNoteMenu = null;
            const coverSurface = document.getElementById('notebook-cover-surface');
            if (!skipAnimate && coverSurface) {
                coverSurface.style.transition = 'transform 320ms cubic-bezier(0.2, 0.72, 0.18, 1)';
                coverSurface.style.transform = 'translateX(-18px) rotateY(-162deg)';
                window.setTimeout(() => openNotebookCover(true), 270);
                return;
            }

            notebookCoverOpen = true;
            renderList();
            contentDiv.scrollTop = 0;
        }

        function goToNotebookPage(direction) {
            if (!currentIndexRecipeIds.length) return;
            const nextIndex = Math.max(0, Math.min(notebookPageIndex + direction, currentIndexRecipeIds.length - 1));
            if (nextIndex === notebookPageIndex) return;

            activeNotebookStickyNoteMenu = null;
            notebookPageIndex = nextIndex;
            renderList();
            contentDiv.scrollTop = 0;
        }

        function isNotebookInteractiveTarget(target) {
            return target instanceof Element && Boolean(target.closest('button, a, input, textarea, select, label, [role="button"], [data-notebook-note-index], [data-notebook-note-control]'));
        }

        function openNotebookRecipeForCooking(recipeId) {
            const recipe = recipes.find(item => item.id === recipeId);
            if (!recipe) return;

            renderDetail(recipeId);
            contentDiv.scrollTop = 0;

            if (!(recipe.instructions || []).length) {
                showToast('Recipe opened. Add instructions to unlock cooking mode.', 'book-open');
                return;
            }

            if (!isCookingMode) toggleCookingMode(recipeId);
        }

        function toggleNotebookStickyNotesVisibility() {
            activeNotebookStickyNoteMenu = null;
            userSettings.showNotebookStickyNotes = userSettings.showNotebookStickyNotes === false;
            saveData();
            if (currentView === 'index' && indexViewMode === 'book') {
                renderList();
            }
        }

        function openNotebookStickyNoteMenu(recipeId, noteIndex) { if(!userSettings.premium) { showPremiumModal("use sticky notes"); return; }
            if (activeNotebookStickyNoteMenu?.recipeId === recipeId && activeNotebookStickyNoteMenu?.noteIndex === noteIndex) {
                focusNotebookStickyNoteEditor(recipeId, noteIndex);
                return;
            }

            activeNotebookStickyNoteMenu = { recipeId, noteIndex };
            if (currentView === 'index' && indexViewMode === 'book') {
                renderList();
            }

            focusNotebookStickyNoteEditor(recipeId, noteIndex);
        }

        function closeNotebookStickyNoteMenu() {
            if (!activeNotebookStickyNoteMenu) return;

            activeNotebookStickyNoteMenu = null;
            if (currentView === 'index' && indexViewMode === 'book') {
                renderList();
            }
        }

        function updateNotebookStickyNoteText(recipeId, noteIndex, value) {
            const recipe = recipes.find(item => item.id === recipeId);
            if (!recipe?.notebookStickyNotes?.[noteIndex]) return;

            const nextText = String(value).slice(0, 160);
            recipe.notebookStickyNotes[noteIndex].text = nextText;
            saveData();

            const noteId = recipe.notebookStickyNotes[noteIndex].id;
            const nextPreviewMarkup = escapeHTML(getNotebookStickyNotePreviewText(recipe.notebookStickyNotes[noteIndex])).replace(/\n/g, '<br>');
            document.querySelectorAll(`[data-notebook-note-preview="${noteId}"]`).forEach(node => {
                node.innerHTML = nextPreviewMarkup;
            });
        }

        function setNotebookStickyNoteColor(recipeId, noteIndex, color) {
            const recipe = recipes.find(item => item.id === recipeId);
            if (!recipe?.notebookStickyNotes?.[noteIndex]) return;

            recipe.notebookStickyNotes[noteIndex].color = color;
            saveData();
            if (currentView === 'index' && indexViewMode === 'book') {
                renderList();
            }
        }

        function deleteNotebookStickyNote(recipeId, noteIndex) {
            const recipe = recipes.find(item => item.id === recipeId);
            if (!recipe?.notebookStickyNotes?.[noteIndex]) return;

            recipe.notebookStickyNotes.splice(noteIndex, 1);
            activeNotebookStickyNoteMenu = null;
            saveData();
            showToast('Sticky note removed!', 'trash-2');
            if (currentView === 'index' && indexViewMode === 'book') {
                renderList();
            }
        }

        function attachNotebookStickyNoteInteractions(surface) {
            const recipeId = Number(surface?.dataset.recipeId);
            if (!recipeId) return;

            const recipe = recipes.find(item => item.id === recipeId);
            if (!recipe) return;

            recipe.notebookStickyNotes = normalizeNotebookStickyNotes(recipe.notebookStickyNotes);

            surface.querySelectorAll('[data-notebook-note-index]').forEach(noteEl => {
                const noteIndex = Number(noteEl.dataset.notebookNoteIndex);
                const noteCard = noteEl.querySelector('[data-notebook-note-card]');

                noteEl.querySelectorAll('[data-notebook-note-handle]').forEach(handleEl => {
                    handleEl.addEventListener('pointerdown', event => {
                        if (event.pointerType === 'mouse' && event.button !== 0) return;

                        event.preventDefault();
                        event.stopPropagation();

                        if (!recipe.notebookStickyNotes?.[noteIndex] || !noteCard) return;

                        const noteRect = noteEl.getBoundingClientRect();
                        const centerX = noteRect.left + (noteRect.width / 2);
                        const centerY = noteRect.top + (noteRect.height / 2);
                        const startScale = clampNotebookStickyNoteScale(recipe.notebookStickyNotes[noteIndex].scale);
                        const startRotation = clampNotebookStickyNoteRotation(recipe.notebookStickyNotes[noteIndex].rotation);
                        const startDistance = Math.max(1, Math.hypot(event.clientX - centerX, event.clientY - centerY));
                        const startAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX);

                        const moveHandle = moveEvent => {
                            const nextDistance = Math.max(1, Math.hypot(moveEvent.clientX - centerX, moveEvent.clientY - centerY));
                            const nextAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
                            let angleDelta = (nextAngle - startAngle) * (180 / Math.PI);

                            if (angleDelta > 180) angleDelta -= 360;
                            if (angleDelta < -180) angleDelta += 360;

                            const nextScale = clampNotebookStickyNoteScale(startScale * (nextDistance / startDistance));
                            const nextRotation = clampNotebookStickyNoteRotation(startRotation + angleDelta);

                            recipe.notebookStickyNotes[noteIndex].scale = nextScale;
                            recipe.notebookStickyNotes[noteIndex].rotation = nextRotation;
                            noteCard.style.transform = `rotate(${nextRotation}deg) scale(${nextScale})`;
                        };

                        const stopHandleDrag = () => {
                            window.removeEventListener('pointermove', moveHandle);
                            window.removeEventListener('pointerup', stopHandleDrag);
                            window.removeEventListener('pointercancel', stopHandleDrag);
                            saveData();
                        };

                        window.addEventListener('pointermove', moveHandle);
                        window.addEventListener('pointerup', stopHandleDrag);
                        window.addEventListener('pointercancel', stopHandleDrag);
                        handleEl.setPointerCapture?.(event.pointerId);
                    });
                });

                noteEl.addEventListener('pointerdown', event => {
                    if (event.pointerType === 'mouse' && event.button !== 0) return;
                    if (event.target.closest('[data-notebook-note-handle]')) return;

                    event.preventDefault();
                    event.stopPropagation();

                    if (!recipe.notebookStickyNotes?.[noteIndex]) return;

                    const rect = surface.getBoundingClientRect();
                    const startX = event.clientX;
                    const startY = event.clientY;
                    let didDrag = false;

                    const moveNote = moveEvent => {
                        if (Math.abs(moveEvent.clientX - startX) > 4 || Math.abs(moveEvent.clientY - startY) > 4) {
                            didDrag = true;
                        }
                        const nextX = clampNotebookStickyNoteX(((moveEvent.clientX - rect.left) / rect.width) * 100);
                        const nextY = clampNotebookStickyNoteY(((moveEvent.clientY - rect.top) / rect.height) * 100);
                        recipe.notebookStickyNotes[noteIndex].x = nextX;
                        recipe.notebookStickyNotes[noteIndex].y = nextY;
                        noteEl.style.left = `${nextX}%`;
                        noteEl.style.top = `${nextY}%`;
                    };

                    const stopDragging = () => {
                        window.removeEventListener('pointermove', moveNote);
                        window.removeEventListener('pointerup', stopDragging);
                        window.removeEventListener('pointercancel', stopDragging);
                        saveData();
                        if (!didDrag) {
                            openNotebookStickyNoteMenu(recipeId, noteIndex);
                        }
                    };

                    window.addEventListener('pointermove', moveNote);
                    window.addEventListener('pointerup', stopDragging);
                    window.addEventListener('pointercancel', stopDragging);
                    noteEl.setPointerCapture?.(event.pointerId);
                });
            });
        }

        function attachNotebookInteractions() {
            const surface = document.getElementById('notebook-swipe-surface');
            const coverSurface = document.getElementById('notebook-cover-surface');

            if (coverSurface) {
                let startX = 0;
                let startY = 0;
                let pointerId = null;
                let isDragging = false;

                const resetCover = () => {
                    coverSurface.style.transition = 'transform 260ms cubic-bezier(0.2, 0.72, 0.18, 1)';
                    coverSurface.style.transform = '';
                    window.setTimeout(() => {
                        coverSurface.style.transition = '';
                    }, 260);
                };

                coverSurface.addEventListener('pointerdown', event => {
                    if (event.pointerType === 'mouse' && event.button !== 0) return;
                    startX = event.clientX;
                    startY = event.clientY;
                    pointerId = event.pointerId;
                    isDragging = true;
                    coverSurface.style.transition = '';
                    coverSurface.setPointerCapture?.(event.pointerId);
                });

                coverSurface.addEventListener('pointermove', event => {
                    if (!isDragging || pointerId !== event.pointerId) return;

                    const deltaX = Math.min(0, event.clientX - startX);
                    const rotateY = Math.max(-160, deltaX * 0.95);
                    const drift = Math.max(-26, deltaX * 0.12);
                    coverSurface.style.transform = `translateX(${drift}px) rotateY(${rotateY}deg)`;
                });

                const finishCoverDrag = event => {
                    if (!isDragging || pointerId !== event.pointerId) return;

                    isDragging = false;
                    const deltaX = event.clientX - startX;
                    const deltaY = event.clientY - startY;
                    if (deltaX < -90 && Math.abs(deltaX) > Math.abs(deltaY)) {
                        coverSurface.style.transition = 'transform 300ms cubic-bezier(0.2, 0.72, 0.18, 1)';
                        coverSurface.style.transform = 'translateX(-18px) rotateY(-162deg)';
                        window.setTimeout(() => openNotebookCover(true), 260);
                        return;
                    }
                    resetCover();
                };

                coverSurface.addEventListener('pointerup', finishCoverDrag);
                coverSurface.addEventListener('pointercancel', finishCoverDrag);
                coverSurface.addEventListener('lostpointercapture', () => {
                    isDragging = false;
                    resetCover();
                });
                return;
            }

            if (!surface) return;

            let startX = 0;
            let startY = 0;
            let pointerId = null;
            let isDragging = false;

            surface.addEventListener('pointerdown', event => {
                if (event.pointerType === 'mouse' && event.button !== 0) return;
                if (isNotebookInteractiveTarget(event.target)) return;
                startX = event.clientX;
                startY = event.clientY;
                pointerId = event.pointerId;
                isDragging = true;
                surface.setPointerCapture?.(event.pointerId);
            });

            const finishSwipe = event => {
                if (!isDragging || pointerId !== event.pointerId) return;

                isDragging = false;
                const deltaX = event.clientX - startX;
                const deltaY = event.clientY - startY;

                if (Math.abs(deltaX) > 90 && Math.abs(deltaX) > Math.abs(deltaY)) {
                    if (deltaX < 0) goToNotebookPage(1);
                    else goToNotebookPage(-1);
                    return;
                }
            };

            surface.addEventListener('pointerup', finishSwipe);
            surface.addEventListener('pointercancel', finishSwipe);
            surface.addEventListener('lostpointercapture', () => {
                isDragging = false;
            });

            attachNotebookStickyNoteInteractions(surface);
        }

        function buildNotebookIndexView(filteredRecipes, activeFilters) {
            const recipe = filteredRecipes[notebookPageIndex];
            if (!recipe) return '';

            const coverConfig = normalizeNotebookCover(userSettings.notebookCover);
            const totalPages = filteredRecipes.length;
            const recipeMood = recipe.source === 'published' ? 'Saved from another cook' : 'Written in your own archive';
            const previewSteps = (recipe.instructions || []).slice(0, 7);
            const extraSteps = Math.max(0, (recipe.instructions || []).length - previewSteps.length);
            const previewIngredients = (recipe.ingredients || []).slice(0, 12);
            const extraIngredients = Math.max(0, (recipe.ingredients || []).length - previewIngredients.length);
            const hasActiveFilters = activeFilters.length > 0;
            const notebookStickyNotes = normalizeNotebookStickyNotes(recipe.notebookStickyNotes);
            const showNotebookStickyNotes = userSettings.showNotebookStickyNotes !== false;
            const hasNotebookStickyNote = notebookStickyNotes.length > 0;
            const notebookNoteActionLabel = hasNotebookStickyNote ? 'Edit note' : 'Add note';
            const notebookVisibilityActionLabel = showNotebookStickyNotes ? 'Hide notes' : 'Show notes';
            recipe.notebookStickyNotes = notebookStickyNotes;

            if (!notebookCoverOpen) {
                const previewTitle = escapeHTML(recipe.title || 'Untitled recipe');
                const previewCategory = escapeHTML(recipe.category || 'Recipe');
                const previewSourceText = recipe.source === 'published'
                    ? `Saved from ${escapeHTML(recipe.author || 'another cook')}`
                    : 'From your own kitchen notebook';
                const latestOpenedRecipe = filteredRecipes.reduce((latestRecipe, currentRecipe) => {
                    if (!currentRecipe?.lastOpened) return latestRecipe;
                    if (!latestRecipe || currentRecipe.lastOpened > latestRecipe.lastOpened) return currentRecipe;
                    return latestRecipe;
                }, null);
                const latestOpenedDate = latestOpenedRecipe
                    ? new Date(latestOpenedRecipe.lastOpened).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                    : '';
                const activeFilterPills = hasActiveFilters
                    ? activeFilters.map(filter => `<span class="notebook-landing-pill">${escapeHTML(filter)}</span>`).join('')
                    : '';

                return `
                    <div class="mb-8">
                        <section class="notebook-landing-hero">
                            <div class="notebook-landing-cover-column">
                                <div class="notebook-cover-shell notebook-book-cover-frame notebook-landing-cover-frame">
                                    <div id="notebook-cover-surface" class="notebook-book-cover-surface notebook-cover-panel notebook-landing-cover-surface overflow-hidden rounded-[32px] border px-6 py-6 text-[#2b241a] md:px-8 md:py-8" style="${getNotebookCoverPanelStyle(coverConfig)}" role="button" tabindex="0" aria-label="Open notebook" data-cover-openable="true" onclick="openNotebookCover()" onkeydown="if (event.target !== event.currentTarget) return; if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openNotebookCover(); }">
                                        ${renderNotebookCoverFace(coverConfig, recipe, totalPages, false)}
                                    </div>
                                </div>
                                <p class="notebook-landing-meta-note justify-center md:justify-start">
                                    <i data-lucide="hand" class="h-4 w-4 text-gold"></i>
                                    Drag from the fore edge, tap the cover, or press Enter to open.
                                </p>
                            </div>

                            <div class="notebook-landing-copy">
                                <div>
                                    <p class="text-[11px] font-bold uppercase tracking-[0.32em] text-sage opacity-80">Notebook mode</p>
                                    <h2 class="mt-3 max-w-3xl font-fantasy text-4xl font-bold leading-[0.95] text-forest md:text-5xl">A smaller, editorial entry into your filtered recipe notebook.</h2>
                                    <p class="mt-4 max-w-2xl text-sm font-semibold leading-relaxed text-sage md:text-base">${totalPages} recipe${totalPages === 1 ? '' : 's'} ${hasActiveFilters ? 'match your current filters' : 'sit in this notebook'} and the cover opens directly to your current preview spread.</p>
                                </div>

                                <div class="notebook-landing-stat-grid">
                                    <div class="notebook-landing-stat">
                                        <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-sage opacity-70">Recipes in view</p>
                                        <p class="mt-3 text-4xl font-bold text-forest">${totalPages}</p>
                                        <p class="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-sage">${hasActiveFilters ? 'Current filtered set' : 'Full notebook archive'}</p>
                                    </div>
                                    <div class="notebook-landing-stat">
                                        <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-sage opacity-70">Preview recipe</p>
                                        <p class="mt-3 font-fantasy text-2xl font-bold leading-tight text-forest">${previewTitle}</p>
                                        <p class="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-sage">${previewCategory} Â· page ${notebookPageIndex + 1} of ${totalPages}</p>
                                    </div>
                                </div>

                                <div class="notebook-landing-section">
                                    <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-sage opacity-70">Preview mood</p>
                                    <h3 class="mt-3 font-fantasy text-3xl font-bold leading-tight text-forest">${previewTitle}</h3>
                                    <p class="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-gold">${previewSourceText}</p>
                                    <p class="mt-3 text-sm font-semibold leading-relaxed text-sage md:text-base">${escapeHTML(recipeMood)}</p>
                                </div>

                                ${latestOpenedRecipe ? `
                                    <div class="notebook-landing-section">
                                        <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-sage opacity-70">Last opened</p>
                                        <div class="mt-3 flex items-start gap-3">
                                            <span class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-gold shadow-sm">
                                                <i data-lucide="history" class="h-5 w-5"></i>
                                            </span>
                                            <div>
                                                <p class="font-bold text-forest">${escapeHTML(latestOpenedRecipe.title || 'Untitled recipe')}</p>
                                                <p class="mt-1 text-sm font-semibold leading-relaxed text-sage">Opened ${latestOpenedDate}${latestOpenedRecipe.source === 'published' ? ' Â· saved collection' : ' Â· personal archive'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ` : ''}

                                ${hasActiveFilters ? `
                                    <div>
                                        <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-sage opacity-70">Active filters</p>
                                        <div class="notebook-landing-pill-row mt-3">${activeFilterPills}</div>
                                    </div>
                                ` : ''}

                                <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <button onclick="openNotebookCover()" class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-forest px-6 text-xs font-bold uppercase tracking-[0.24em] text-white shadow-[0_16px_28px_rgba(45,77,52,0.24)] transition-colors hover:bg-sage">
                                        <i data-lucide="book-open" class="h-4 w-4"></i> Open notebook
                                    </button>
                                    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Cover Edit stays separate from opening the notebook.</p>
                                </div>
                            </div>
                        </section>
                    </div>
                `;
            }

            return `
                <div class="mb-8">
                    <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p class="text-[11px] font-bold uppercase tracking-[0.3em] text-sage opacity-80">Notebook mode</p>
                            <p class="mt-1 text-sm font-semibold text-sage opacity-80">Swipe or use the arrows to browse your collection. Search and filters switch back to the card view.</p>
                            ${hasActiveFilters ? `<p class="mt-2 text-[11px] font-bold uppercase tracking-[0.24em] text-gold">Filtered spread: ${activeFilters.length} active filter${activeFilters.length === 1 ? '' : 's'}</p>` : ''}
                        </div>
                        <div class="flex flex-row flex-wrap items-center justify-end gap-2">
                            <button type="button" title="${notebookNoteActionLabel}" aria-label="${notebookNoteActionLabel}" onclick="openNotebookStickyNotesEditor(${recipe.id})" class="notebook-note-control notebook-note-control--manage notebook-note-control--icon" data-notebook-note-control="manage-notes">
                                <i data-lucide="sticky-note" class="h-4 w-4 text-gold"></i>
                            </button>
                            <button type="button" title="${notebookVisibilityActionLabel}" aria-label="${notebookVisibilityActionLabel}" onclick="toggleNotebookStickyNotesVisibility()" class="notebook-note-control notebook-note-control--toggle notebook-note-control--icon" data-notebook-note-control="toggle-visibility">
                                <i data-lucide="${showNotebookStickyNotes ? 'eye-off' : 'eye'}" class="h-4 w-4 ${showNotebookStickyNotes ? 'text-sage' : 'text-gold'}"></i>
                            </button>
                            <span class="inline-flex h-11 items-center rounded-xl border border-parchmentDark bg-white px-4 text-xs font-bold uppercase tracking-[0.24em] text-sage shadow-sm">Page ${notebookPageIndex + 1} / ${totalPages}</span>
                        </div>
                    </div>

                    <div class="notebook-book-frame relative">
                        <div id="notebook-swipe-surface" data-recipe-id="${recipe.id}" class="notebook-book-spread-surface notebook-swipe-surface notebook-spread relative overflow-hidden rounded-[28px] border border-sage border-opacity-20 px-4 py-4 shadow-[0_30px_60px_rgba(44,61,46,0.16)] md:px-7 md:py-7">
                            <div class="pointer-events-none absolute inset-y-6 left-7 hidden w-8 rounded-full border-x border-parchmentDark bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95)_0,rgba(255,255,255,0.7)_58%,rgba(239,239,239,0.88)_100%)] md:block"></div>
                            <div class="pointer-events-none absolute inset-y-8 left-[3.65rem] hidden w-px bg-gradient-to-b from-transparent via-sage/20 to-transparent md:block"></div>
                            ${renderNotebookStickyNotes(recipe.id, notebookStickyNotes, showNotebookStickyNotes)}

                            <div class="grid h-full grid-cols-1 gap-4 md:grid-cols-2 md:gap-0">
                                <section class="notebook-paper notebook-paper-left rounded-[24px] border border-white border-opacity-70 px-6 py-6 md:h-full md:rounded-r-none md:border-r-0">
                                    <div class="notebook-paper__body">
                                        <p class="text-[11px] font-bold uppercase tracking-[0.3em] text-sage opacity-80">Recipe page</p>
                                        <h3 class="mt-2 font-fantasy text-4xl font-bold text-forest leading-[1.02] md:text-5xl">${recipe.title}</h3>
                                        <div class="notebook-ruled-block mt-4 text-sm font-semibold text-sage">
                                            <div class="notebook-line-row">${recipeMood}</div>
                                            <div class="notebook-line-row text-[11px] font-bold uppercase tracking-[0.22em]">
                                                <span>${recipe.category || 'Recipe'}</span>
                                                ${recipe.difficulty ? `<span>Â· ${recipe.difficulty}</span>` : ''}
                                                ${recipe.country ? `<span>Â· ${recipe.country}</span>` : ''}
                                            </div>
                                        </div>

                                        <div class="mt-5 grid grid-cols-3 gap-5 text-sm font-semibold text-forest">
                                            <div>
                                                <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-sage">Prep</p>
                                                <div class="notebook-line-row border-b-0 text-2xl font-bold">${recipe.prepTime || 0}m</div>
                                            </div>
                                            <div>
                                                <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-sage">Cook</p>
                                                <div class="notebook-line-row border-b-0 text-2xl font-bold">${recipe.cookTime || 0}m</div>
                                            </div>
                                            <div>
                                                <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-sage">Serves</p>
                                                <div class="notebook-line-row border-b-0 text-2xl font-bold">${recipe.servings || 0}</div>
                                            </div>
                                        </div>

                                        <div class="mt-6">
                                            <div class="flex items-center justify-between">
                                                <p class="text-xs font-bold uppercase tracking-[0.28em] text-sage">Ingredients</p>
                                                <span class="text-[10px] font-bold uppercase tracking-[0.22em] text-sage opacity-75">${recipe.ingredients?.length || 0} total</span>
                                            </div>
                                            <ul class="notebook-ruled-block mt-1 text-sm font-semibold text-forest">
                                                ${previewIngredients.map(ingredient => `<li class="notebook-line-row"><span class="text-gold text-lg">â€¢</span><span class="notebook-line-text">${applyMeasurementSystem(ingredient)}</span></li>`).join('')}
                                            </ul>
                                            ${extraIngredients > 0 ? `<p class="pt-3 text-xs font-bold uppercase tracking-[0.22em] text-sage opacity-80">+ ${extraIngredients} more ingredients in the full recipe</p>` : ''}
                                        </div>
                                    </div>

                                    <div class="notebook-paper__footer flex items-end justify-start">
                                        <button type="button" onclick="goToNotebookPage(-1)" ${notebookPageIndex === 0 ? 'disabled' : ''} class="notebook-page-nav">
                                            <i data-lucide="chevron-left" class="h-4 w-4"></i> Vorige
                                        </button>
                                    </div>
                                </section>

                                <section class="notebook-paper notebook-paper-right rounded-[24px] border border-white border-opacity-70 px-6 py-6 md:h-full md:rounded-l-none">
                                    <div class="notebook-paper__body">
                                        <div class="flex items-start justify-between gap-4">
                                            <div>
                                                <p class="text-[11px] font-bold uppercase tracking-[0.3em] text-sage opacity-80">Recipe story</p>
                                                <div class="notebook-ruled-block mt-2 text-sm font-semibold text-sage">
                                                    <div class="notebook-line-row">By ${recipe.author || 'Chef'}${recipe.lastOpened ? ` Â· last opened ${new Date(recipe.lastOpened).toLocaleDateString()}` : ''}</div>
                                                </div>
                                            </div>
                                            <div class="relative w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-cover bg-center rotate-[3deg]" style="background-image:url('${recipe.profile || defaultPlaceholderProfile}')">
                                                <div class="absolute -top-2 right-5 h-4 w-10 rounded-full bg-gold bg-opacity-70 blur-[1px]"></div>
                                            </div>
                                        </div>

                                        <div class="mt-6">
                                            <div class="mb-1 flex items-center justify-between gap-3">
                                                <p class="text-xs font-bold uppercase tracking-[0.28em] text-sage">Instructions</p>
                                                <span class="text-[10px] font-bold uppercase tracking-[0.22em] text-sage opacity-75">Swipe for next page</span>
                                            </div>
                                            <ol class="notebook-ruled-block text-sm font-semibold text-forest">
                                                ${previewSteps.map((step, index) => `
                                                    <li class="notebook-line-row notebook-line-row--top">
                                                        <span class="mt-[6px] inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-sage text-white text-[10px] font-bold">${index + 1}</span>
                                                        <span class="notebook-line-text">${applyMeasurementSystem(getRecipeInstructionText(step))}</span>
                                                    </li>
                                                `).join('')}
                                            </ol>
                                            ${extraSteps > 0 ? `<p class="pt-3 text-xs font-bold uppercase tracking-[0.22em] text-sage opacity-80">+ ${extraSteps} more steps in the full recipe</p>` : ''}
                                        </div>

                                        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div class="text-[11px] font-bold uppercase tracking-[0.2em] text-sage">
                                                ${(recipe.diet || []).length > 0 ? recipe.diet.join(' Â· ') : 'No diet tags'}
                                            </div>
                                            <button type="button" onclick="openNotebookRecipeForCooking(${recipe.id})" class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-gold bg-gold px-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-sm transition-all hover:border-yellow-600 hover:bg-yellow-600 sm:w-auto">
                                                <i data-lucide="chef-hat" class="h-4 w-4"></i> Start Cooking
                                            </button>
                                        </div>
                                    </div>

                                    <div class="notebook-paper__footer flex items-end justify-end">
                                        <button type="button" onclick="goToNotebookPage(1)" ${notebookPageIndex === totalPages - 1 ? 'disabled' : ''} class="notebook-page-nav notebook-page-nav--primary">
                                            Volgende <i data-lucide="chevron-right" class="h-4 w-4"></i>
                                        </button>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderList() {
            isCookingMode = false;
            document.getElementById('body').classList.remove('cooking-mode-active');
            setActiveNav('index');
            ensurePublishedRecipesCacheLoaded();

            collectionScopeFilter = normalizeCollectionScopeFilter(collectionScopeFilter);

            const collectionScopeCounts = {
                mine: recipes.filter(recipe => recipe.source !== 'published').length,
                saved: recipes.filter(recipe => recipe.source === 'published').length
            };

            const filteredRecipes = recipes.filter(r => {
                const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.ingredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
                const matchesCategory = categoryFilter === "" || r.category === categoryFilter;
                const matchesDifficulty = difficultyFilter === "" || r.difficulty === difficultyFilter;
                const matchesDiet = doesRecipeMatchDietFilters(r);
                const matchesCuisine = cuisineFilter === "" || (r.cuisine && r.cuisine.toLowerCase() === cuisineFilter.toLowerCase());
                const matchesFavorite = !showFavoritesOnly || isRecipeFavorited(r);
                const matchesCollectionScope = doesRecipeMatchCollectionScope(r);
                return matchesSearch && matchesCategory && matchesDifficulty && matchesDiet && matchesCuisine && matchesFavorite && matchesCollectionScope;
            });

            const activeFilters = [
                collectionScopeFilter !== 'all' ? `Source: ${getCollectionScopeLabel()}` : '',
                searchQuery.trim() ? `Search: ${searchQuery.trim()}` : '',
                categoryFilter ? `Category: ${categoryFilter}` : '',
                difficultyFilter ? `Level: ${difficultyFilter}` : '',
                cuisineFilter ? `Cuisine: ${cuisineFilter}` : '',
                ...dietFilter.map(item => `Diet: ${item}`),
                showFavoritesOnly ? 'Favorites only' : ''
            ].filter(Boolean);

            currentIndexRecipeIds = filteredRecipes.map(recipe => recipe.id);
            if (currentIndexRecipeIds.length === 0) {
                notebookPageIndex = 0;
            } else {
                notebookPageIndex = Math.max(0, Math.min(notebookPageIndex, currentIndexRecipeIds.length - 1));
            }

            const resultLabel = `${filteredRecipes.length} recipe${filteredRecipes.length === 1 ? '' : 's'}`;
            const hasActiveListFilters = Boolean(collectionScopeFilter !== 'all' || categoryFilter || difficultyFilter || cuisineFilter || showFavoritesOnly || dietFilter.length);
            const isNotebookMode = indexViewMode === 'book';
            const isSearchVisible = !isNotebookMode && showListSearch;
            const isFilterVisible = !isNotebookMode && showListFilters;
            const activeFiltersMarkup = activeFilters.length > 0 ? `
                <div class="border-b border-parchmentDark bg-white px-5 py-4">
                    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="text-[11px] font-bold uppercase tracking-[0.28em] text-sage opacity-80">Active</span>
                            ${activeFilters.map(filter => `<span class="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-sage shadow-sm border border-parchmentDark">${filter}</span>`).join('')}
                        </div>
                        <button onclick="resetRecipeFilters()" class="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-parchmentDark bg-white px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-sage shadow-sm transition-all hover:border-gold hover:text-forest">
                            <i data-lucide="rotate-ccw" class="h-4 w-4"></i>Clear filters
                        </button>
                    </div>
                </div>
            ` : '';
            const sourceFilterButtonsMarkup = [
                { value: 'mine', label: 'Mine', icon: 'notebook-pen', count: collectionScopeCounts.mine },
                { value: 'saved', label: 'Saved', icon: 'heart-handshake', count: collectionScopeCounts.saved }
            ].map(scope => {
                const isActive = collectionScopeFilter === scope.value;
                const nextScope = isActive ? 'all' : scope.value;
                return `<button type="button" onclick="collectionScopeFilter='${nextScope}'; renderList()" class="inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-xs font-bold uppercase tracking-[0.18em] shadow-sm transition-all ${isActive ? 'border-forest bg-forest text-white' : 'border-parchmentDark bg-white text-sage hover:border-gold hover:text-forest'}"><i data-lucide="${scope.icon}" class="h-4 w-4"></i>${scope.label} <span class="rounded-full ${isActive ? 'bg-white bg-opacity-20 text-white' : 'bg-accent text-sage'} px-2 py-0.5 text-[10px]">${scope.count}</span></button>`;
            }).join('');
            const selectedDietSummary = dietFilter.length === 0
                ? 'Optional'
                : (dietFilter.length === 1 ? dietFilter[0] : `${dietFilter.length} selected`);
            const dietFilterButtonsMarkup = dietOptions.map(option => {
                const isActive = dietFilter.includes(option);
                const desc = dietDescriptions[option] || '';
                return `<button type="button" onclick="toggleDietFilterOption('${option}')" aria-label="${option}: ${desc}" class="rounded-full border px-4 py-2 text-sm font-bold transition-all ${isActive ? 'border-forest bg-forest text-white shadow-sm' : 'border-sage border-opacity-20 bg-white text-sage hover:border-gold hover:text-forest'}">${option}</button>`;
            }).join('');
            const dietGuideMarkup = dietOptions.map(option => `<div class="rounded-xl border border-sage border-opacity-10 bg-white p-3 shadow-sm">
                <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-forest">${option}</p>
                <p class="mt-2 text-xs font-semibold leading-relaxed text-sage">${dietDescriptions[option] || ''}</p>
            </div>`).join('');

            let html = `
                <div class="mb-8 overflow-hidden rounded-2xl border border-parchmentDark bg-white shadow-lg">
                    <div class="border-b border-parchmentDark bg-gradient-to-r from-accent via-white to-parchment px-5 py-5">
                        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p class="text-[11px] font-bold uppercase tracking-[0.32em] text-sage opacity-80">Your saved collection</p>
                                <h2 class="font-fantasy text-3xl font-bold text-forest">Index your own and liked recipes</h2>
                                <p class="mt-1 text-sm font-semibold text-sage opacity-80">Search, filter, and open your own recipes and saved Browse finds from one place.</p>
                                <p class="mt-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-sage opacity-80">
                                    <i data-lucide="book-copy" class="h-4 w-4"></i>${resultLabel}
                                </p>
                            </div>
                            <div class="flex flex-wrap items-center justify-end gap-2">
                                <div class="inline-flex rounded-xl border border-parchmentDark bg-white p-1 shadow-sm">
                                    <button onclick="setIndexViewMode('cards')" class="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold uppercase tracking-[0.16em] transition-all ${indexViewMode === 'cards' ? 'bg-forest text-white shadow-sm' : 'text-sage hover:text-forest'}">
                                        <i data-lucide="layout-grid" class="h-4 w-4"></i>Cards
                                    </button>
                                    <button onclick="setIndexViewMode('book')" class="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold uppercase tracking-[0.16em] transition-all ${indexViewMode === 'book' ? 'bg-forest text-white shadow-sm' : 'text-sage hover:text-forest'}">
                                        <i data-lucide="book-open" class="h-4 w-4"></i>Notebook
                                    </button>
                                </div>
                                <button onclick="toggleListSearchVisibility()" aria-label="Search" class="inline-flex h-11 w-11 items-center justify-center rounded-xl border text-xs font-bold uppercase tracking-[0.18em] shadow-sm transition-all ${isSearchVisible ? 'border-forest bg-forest text-white' : 'border-parchmentDark bg-white text-sage hover:border-gold hover:text-forest'}" title="${isNotebookMode ? 'Switch to card view and open search' : 'Toggle search'}">
                                    <i data-lucide="search" class="h-4 w-4"></i>
                                </button>
                                <button onclick="toggleListFiltersVisibility()" aria-label="Filters" class="inline-flex h-11 w-11 items-center justify-center rounded-xl border text-xs font-bold uppercase tracking-[0.18em] shadow-sm transition-all ${isFilterVisible ? 'border-forest bg-forest text-white' : 'border-parchmentDark bg-white text-sage hover:border-gold hover:text-forest'}" title="${isNotebookMode ? 'Switch to card view and open filters' : 'Toggle filters'}">
                                    <i data-lucide="sliders-horizontal" class="h-4 w-4"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    ${activeFiltersMarkup}

                    ${(isSearchVisible || isFilterVisible) ? `
                        <div class="space-y-5 p-5">
                            ${isSearchVisible ? `
                                <div class="relative">
                                    <i data-lucide="search" class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sage opacity-70"></i>
                                    <input type="text" placeholder="Search by title, ingredient, or occasion..." value="${searchQuery}" oninput="searchQuery = this.value; renderList()" class="w-full h-14 rounded-xl border border-accent bg-parchment px-12 text-base font-semibold text-forest shadow-sm outline-none transition-all focus:border-gold focus:bg-white">
                                </div>
                            ` : ''}

                            ${isFilterVisible ? `
                                <div class="space-y-5">
                                    <div class="rounded-xl border border-accent bg-accent bg-opacity-30 p-4">
                                        <div>
                                            <p class="text-[11px] font-bold uppercase tracking-[0.28em] text-sage opacity-80">Source</p>
                                            <p class="mt-1 text-sm font-semibold text-sage">Toggle between recipes you wrote and recipes you saved from Browse.</p>
                                        </div>

                                        <div class="mt-4 flex flex-wrap gap-2">
                                            ${sourceFilterButtonsMarkup}
                                        </div>
                                    </div>

                                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                                        <div class="space-y-2">
                                            <label class="block text-[11px] font-bold uppercase tracking-[0.28em] text-sage opacity-80">Category</label>
                                            <div class="relative">
                                                <select onchange="categoryFilter = this.value; renderList()" class="h-14 w-full appearance-none rounded-xl border border-sage border-opacity-20 bg-white px-4 pr-11 text-sm font-semibold text-forest shadow-sm outline-none transition-all focus:border-gold focus:shadow-md">
                                                    <option value="">All categories</option>
                                                    <option value="Baking" ${categoryFilter === 'Baking' ? 'selected' : ''}>Baking</option>
                                                    <option value="Cooking" ${categoryFilter === 'Cooking' ? 'selected' : ''}>Cooking</option>
                                                    <option value="Dessert" ${categoryFilter === 'Dessert' ? 'selected' : ''}>Dessert</option>
                                                    <option value="Drink" ${categoryFilter === 'Drink' ? 'selected' : ''}>Drink</option>
                                                </select>
                                                <i data-lucide="chevron-down" class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sage"></i>
                                            </div>
                                        </div>

                                        <div class="space-y-2">
                                            <label class="block text-[11px] font-bold uppercase tracking-[0.28em] text-sage opacity-80">Difficulty</label>
                                            <div class="relative">
                                                <select onchange="difficultyFilter = this.value; renderList()" class="h-14 w-full appearance-none rounded-xl border border-sage border-opacity-20 bg-white px-4 pr-11 text-sm font-semibold text-forest shadow-sm outline-none transition-all focus:border-gold focus:shadow-md">
                                                    <option value="">All levels</option>
                                                    <option value="Easy" ${difficultyFilter === 'Easy' ? 'selected' : ''}>Easy</option>
                                                    <option value="Medium" ${difficultyFilter === 'Medium' ? 'selected' : ''}>Medium</option>
                                                    <option value="Hard" ${difficultyFilter === 'Hard' ? 'selected' : ''}>Hard</option>
                                                </select>
                                                <i data-lucide="chevron-down" class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sage"></i>
                                            </div>
                                        </div>

                                        <div class="space-y-2">
                                            <label class="block text-[11px] font-bold uppercase tracking-[0.28em] text-sage opacity-80">Cuisine</label>
                                            <div class="relative">
                                                <select onchange="cuisineFilter = this.value; renderList()" class="h-14 w-full appearance-none rounded-xl border border-sage border-opacity-20 bg-white px-4 pr-11 text-sm font-semibold text-forest shadow-sm outline-none transition-all focus:border-gold focus:shadow-md">
                                                    <option value="">All cuisines</option>
                                                    <option value="European" ${cuisineFilter === 'European' ? 'selected' : ''}>European</option>
                                                    <option value="Asian" ${cuisineFilter === 'Asian' ? 'selected' : ''}>Asian</option>
                                                    <option value="Italian" ${cuisineFilter === 'Italian' ? 'selected' : ''}>Italian</option>
                                                    <option value="Mediterranean" ${cuisineFilter === 'Mediterranean' ? 'selected' : ''}>Mediterranean</option>
                                                    <option value="American" ${cuisineFilter === 'American' ? 'selected' : ''}>American</option>
                                                    <option value="Mexican" ${cuisineFilter === 'Mexican' ? 'selected' : ''}>Mexican</option>
                                                </select>
                                                <i data-lucide="chevron-down" class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sage"></i>
                                            </div>
                                        </div>

                                        <div class="space-y-2">
                                            <label class="block text-[11px] font-bold uppercase tracking-[0.28em] text-sage opacity-80">Quick view</label>
                                            <button onclick="showFavoritesOnly = !showFavoritesOnly; renderList()" class="flex h-14 w-full items-center justify-between rounded-xl border px-4 text-sm font-semibold shadow-sm transition-all ${showFavoritesOnly ? 'border-forest bg-forest text-white shadow-md' : 'border-sage border-opacity-20 bg-white text-forest hover:border-gold hover:shadow-md'}">
                                                <span class="flex items-center gap-2">
                                                    <i data-lucide="heart" class="h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}"></i>
                                                    ${showFavoritesOnly ? 'Favorites only' : 'Show favorites'}
                                                </span>
                                                <i data-lucide="chevron-right" class="h-4 w-4 opacity-60"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div class="rounded-xl border border-accent bg-accent bg-opacity-40 p-4">
                                        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <p class="text-[11px] font-bold uppercase tracking-[0.28em] text-sage opacity-80">Diets</p>
                                                <p class="mt-1 text-sm font-semibold text-sage">Use diet tags only when you want to narrow results by dietary fit.</p>
                                            </div>
                                            <div class="flex flex-wrap gap-2">
                                                <button onclick="toggleDietFiltersVisibility()" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-bold uppercase tracking-[0.2em] shadow-sm transition-all ${showDietFilters ? 'border-forest bg-forest text-white' : 'border-sage border-opacity-20 bg-white text-sage hover:border-gold hover:text-forest'}">
                                                    <i data-lucide="leaf" class="h-4 w-4"></i>Diets
                                                    <span class="rounded-full px-2 py-0.5 text-[10px] ${showDietFilters ? 'bg-white bg-opacity-20 text-white' : 'bg-accent text-sage'}">${selectedDietSummary}</span>
                                                    <i data-lucide="${showDietFilters ? 'chevron-up' : 'chevron-down'}" class="h-4 w-4"></i>
                                                </button>
                                                ${showDietFilters ? `<button onclick="toggleDietGuide()" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-sage border-opacity-20 bg-white px-4 text-xs font-bold uppercase tracking-[0.2em] text-sage shadow-sm transition-all hover:border-gold hover:text-forest"><i data-lucide="info" class="h-4 w-4"></i>${showDietGuide ? 'Hide guide' : 'Diet guide'}</button>` : ''}
                                                <button onclick="resetRecipeFilters()" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-sage border-opacity-20 bg-white px-4 text-xs font-bold uppercase tracking-[0.2em] text-sage shadow-sm transition-all hover:border-gold hover:text-forest">
                                                    <i data-lucide="rotate-ccw" class="h-4 w-4"></i>Reset all
                                                </button>
                                            </div>
                                        </div>

                                        ${showDietFilters ? `
                                            <div class="mt-4 border-t border-sage border-opacity-10 pt-4">
                                                <p class="text-xs font-semibold leading-relaxed text-sage">Recipes must satisfy every selected diet. Stricter tags still count, so Vegan also matches Vegetarian, and Keto also matches Low-carb.</p>
                                                <div class="mt-4 flex flex-wrap gap-2">
                                                    ${dietFilterButtonsMarkup}
                                                </div>
                                                ${showDietGuide ? `
                                                    <div class="mt-4 grid gap-3 border-t border-sage border-opacity-10 pt-4 md:grid-cols-2 xl:grid-cols-3">
                                                        ${dietGuideMarkup}
                                                    </div>
                                                ` : ''}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            `;

            if (filteredRecipes.length === 0) {
                html += `
                    <div class="text-center mt-10 p-8 glass-panel rounded-sm border border-parchmentDark">
                        <i data-lucide="package-open" class="w-16 h-16 mx-auto mb-4 text-sage opacity-50"></i>
                        <p class="font-fantasy text-2xl text-forest font-bold mb-2">No recipes found.</p>
                        <p class="text-sm opacity-80 font-semibold">Try adjusting your search or add a new one!</p>
                    </div>`;
            } else if (indexViewMode === 'book') {
                html += buildNotebookIndexView(filteredRecipes, activeFilters);
            } else {
                html += '<div class="grid grid-cols-1 gap-6 pb-6 md:grid-cols-2 lg:grid-cols-3">';
                filteredRecipes.forEach(recipe => {
                    const savedRecipeOutdated = isSavedPublishedRecipeOutdated(recipe);
                    const recipeVersionLabel = getPublishedVersionLabel(recipe);
                    const recipeSourceLabel = recipe.source === 'published'
                        ? 'Saved from Browse'
                        : (isRecipePublishedLive(recipe) ? 'Published live' : (recipe.publishedId ? 'Private draft with publish history' : 'Private recipe'));
                    html += `
                        <div onclick="renderDetail(${recipe.id})" class="relative h-full bg-white rounded-md shadow-sm hover:shadow-xl transition-all cursor-pointer border border-parchmentDark group overflow-hidden flex flex-col">
                            ${savedRecipeOutdated ? `<button onclick="event.stopPropagation(); renderDetail(${recipe.id})" title="Author update available" class="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-gold bg-white text-gold shadow-md transition-all hover:scale-105 hover:text-forest"><i data-lucide="alert-circle" class="h-5 w-5"></i></button>` : ''}
                            <div class="w-full h-48 bg-cover bg-center" style="background-image: url('${recipe.profile || defaultPlaceholderProfile}')"></div>
                            <div class="flex flex-1 flex-col p-5">
                                <div>
                                    <h3 class="min-h-[4rem] font-fantasy font-bold text-2xl text-forest leading-tight group-hover:text-gold transition-colors">${recipe.title}</h3>
                                </div>
                                <p class="text-xs text-sage mt-2 font-semibold flex items-center gap-1"><i data-lucide="user" class="w-3 h-3"></i> ${recipe.author}</p>
                                ${recipeVersionLabel ? `<p class="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-sage opacity-80">${recipeVersionLabel}</p>` : ''}
                                <div class="flex min-h-[1.25rem] flex-wrap gap-2 mt-3 text-[10px] font-semibold text-sage">
                                    ${recipe.prepTime ? `<span class="flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> ${recipe.prepTime}m prep</span>` : ''}
                                    ${recipe.cookTime ? `<span class="flex items-center gap-1"><i data-lucide="flame" class="w-3 h-3"></i> ${recipe.cookTime}m cook</span>` : ''}
                                    ${recipe.servings ? `<span class="flex items-center gap-1"><i data-lucide="users" class="w-3 h-3"></i> ${recipe.servings}</span>` : ''}
                                </div>
                                <div class="mt-4">
                                    <div class="flex min-h-[2rem] flex-wrap content-start gap-2">
                                        <span class="text-[10px] bg-accent text-sage font-bold px-2 py-1 rounded-sm uppercase tracking-wider border border-sage border-opacity-20">${recipe.category || 'Misc'}</span>
                                        ${recipe.difficulty ? `<span class="text-[10px] bg-gold bg-opacity-20 text-sage font-bold px-2 py-1 rounded-sm">${recipe.difficulty}</span>` : ''}
                                        ${recipe.country ? `<span class="text-[10px] bg-accent text-sage font-bold px-2 py-1 rounded-sm uppercase tracking-wider border border-sage border-opacity-20">${recipe.country}</span>` : ''}
                                        ${recipe.source === 'published' ? `<span class="text-[10px] bg-forest bg-opacity-10 text-forest font-bold px-2 py-1 rounded-sm uppercase tracking-wider border border-forest border-opacity-10">Saved</span>` : ''}
                                        ${recipe.source !== 'published' && isRecipePublishedLive(recipe) ? `<span class="text-[10px] bg-forest bg-opacity-10 text-forest font-bold px-2 py-1 rounded-sm uppercase tracking-wider border border-forest border-opacity-10">Live</span>` : ''}
                                        ${savedRecipeOutdated ? `<span class="text-[10px] bg-gold bg-opacity-15 text-forest font-bold px-2 py-1 rounded-sm uppercase tracking-wider border border-gold border-opacity-40">Update available</span>` : ''}
                                        ${recipeNeedsAttention(recipe) && !savedRecipeOutdated ? `<span class="text-[10px] bg-gold bg-opacity-15 text-forest font-bold px-2 py-1 rounded-sm uppercase tracking-wider border border-gold border-opacity-40">Needs attention</span>` : ''}
                                    </div>
                                    <div class="mt-2 flex min-h-[1.5rem] flex-wrap content-start gap-1">
                                        ${recipe.diet && recipe.diet.length > 0 ? recipe.diet.map(d => `<span class="text-[9px] bg-sage bg-opacity-10 text-sage font-bold px-1.5 py-0.5 rounded">${d}</span>`).join('') : ''}
                                    </div>
                                </div>

                                <div class="mt-auto border-t border-accent pt-4">
                                    <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-sage opacity-80">${recipeSourceLabel}</p>
                                </div>
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
            }
            contentDiv.innerHTML = html;
            lucide.createIcons();
            if (indexViewMode === 'book' && filteredRecipes.length > 0) {
                attachNotebookInteractions();
            }
        }

        async function renderBrowse() {
            isCookingMode = false;
            document.getElementById('body').classList.remove('cooking-mode-active');
            setActiveNav('browse');

            const remoteRecipes = firebaseInitialized ? await loadPublishedRecipes() : [];
            const normalizedQuery = browseQuery.trim().toLowerCase();
            const filteredPublishedRecipes = remoteRecipes.filter(recipe => {
                if (!normalizedQuery) return true;
                return [recipe.title, recipe.authorName, recipe.author, recipe.cuisine, ...(recipe.ingredients || [])]
                    .filter(Boolean)
                    .some(value => value.toLowerCase().includes(normalizedQuery));
            });

            let html = `
                <div class="mb-8 overflow-hidden rounded-2xl border border-parchmentDark bg-white shadow-lg">
                    <div class="border-b border-parchmentDark bg-gradient-to-r from-accent via-white to-parchment px-5 py-5">
                        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p class="text-[11px] font-bold uppercase tracking-[0.32em] text-sage opacity-80">Community recipes</p>
                                <h2 class="font-fantasy text-3xl font-bold text-forest">Browse what everyone is cooking</h2>
                                <p class="mt-1 text-sm font-semibold text-sage opacity-80">Explore published recipes from all users and save the ones you love into your Index.</p>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <span class="inline-flex items-center gap-2 rounded-full border border-parchmentDark bg-white px-3 py-2 text-xs font-bold text-sage shadow-sm">
                                    <i data-lucide="globe-2" class="h-4 w-4"></i>${filteredPublishedRecipes.length} published
                                </span>
                                <span class="inline-flex items-center gap-2 rounded-full border border-parchmentDark bg-white px-3 py-2 text-xs font-bold text-sage shadow-sm">
                                    <i data-lucide="heart" class="h-4 w-4"></i>${recipes.filter(recipe => recipe.source === 'published').length} saved
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-5 p-5">
                        <div class="relative">
                            <i data-lucide="search" class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sage opacity-70"></i>
                            <input type="text" placeholder="Search by title, author, ingredient, or cuisine..." value="${browseQuery}" oninput="browseQuery = this.value; renderBrowse()" class="w-full h-14 rounded-xl border border-accent bg-parchment px-12 text-base font-semibold text-forest shadow-sm outline-none transition-all focus:border-gold focus:bg-white">
                        </div>
                    </div>
                </div>
            `;

            if (!firebaseInitialized) {
                html += `
                    <div class="text-center mt-10 p-8 glass-panel rounded-sm border border-parchmentDark bg-white">
                        <i data-lucide="cloud-off" class="w-16 h-16 mx-auto mb-4 text-sage opacity-50"></i>
                        <p class="font-fantasy text-2xl text-forest font-bold mb-2">Browse needs cloud setup.</p>
                        <p class="text-sm opacity-80 font-semibold mb-4">Open Settings and connect Firebase to browse published recipes from everyone.</p>
                        <button onclick="renderSettings()" class="bg-forest text-white h-12 px-6 rounded-sm font-bold hover:bg-sage transition-colors inline-flex items-center gap-2 uppercase tracking-wider text-sm">
                            <i data-lucide="settings-2" class="w-4 h-4"></i> Open Settings
                        </button>
                    </div>
                `;
            } else if (filteredPublishedRecipes.length === 0) {
                html += `
                    <div class="text-center mt-10 p-8 glass-panel rounded-sm border border-parchmentDark bg-white">
                        <i data-lucide="chef-hat" class="w-16 h-16 mx-auto mb-4 text-sage opacity-50"></i>
                        <p class="font-fantasy text-2xl text-forest font-bold mb-2">No published recipes yet.</p>
                        <p class="text-sm opacity-80 font-semibold">Be the first to publish one from your own collection.</p>
                    </div>
                `;
            } else {
                html += '<div class="grid grid-cols-1 gap-6 pb-6 md:grid-cols-2 lg:grid-cols-3">';
                filteredPublishedRecipes.forEach(recipe => {
                    const saved = isPublishedRecipeSaved(recipe.id);
                    const owned = isPublishedRecipeOwnedByCurrentUser(recipe);
                    const versionLabel = getPublishedVersionLabel(recipe);
                    html += `
                        <div onclick="renderPublishedRecipeDetail('${recipe.id}')" class="h-full bg-white rounded-md shadow-sm hover:shadow-xl transition-all cursor-pointer border border-parchmentDark group overflow-hidden relative flex flex-col">
                            <div class="absolute right-4 top-4 z-10">
                                ${owned ? `
                                    <span class="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-sage shadow-md">Yours${versionLabel ? ` Â· ${versionLabel}` : ''}</span>
                                ` : `
                                    <button onclick="event.stopPropagation(); toggleSavedPublishedRecipe('${recipe.id}')" class="w-11 h-11 rounded-full border border-white bg-white ${saved ? 'text-red-500' : 'text-sage'} shadow-md flex items-center justify-center hover:scale-105 transition-all">
                                        <i data-lucide="heart" class="w-5 h-5 ${saved ? 'fill-current' : ''}"></i>
                                    </button>
                                `}
                            </div>
                            <div class="w-full h-48 bg-cover bg-center" style="background-image: url('${recipe.profile || defaultPlaceholderProfile}')"></div>
                            <div class="flex flex-1 flex-col p-5">
                                <div>
                                    <h3 class="min-h-[4rem] font-fantasy font-bold text-2xl text-forest leading-tight group-hover:text-gold transition-colors">${recipe.title}</h3>
                                </div>
                                <p class="text-xs text-sage mt-2 font-semibold flex items-center gap-1"><i data-lucide="user" class="w-3 h-3"></i> ${recipe.authorName || recipe.author || 'Chef'}</p>
                                ${versionLabel ? `<p class="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-sage opacity-80">${versionLabel}</p>` : ''}
                                <div class="flex min-h-[1.25rem] flex-wrap gap-2 mt-3 text-[10px] font-semibold text-sage">
                                    ${recipe.prepTime ? `<span class="flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> ${recipe.prepTime}m prep</span>` : ''}
                                    ${recipe.cookTime ? `<span class="flex items-center gap-1"><i data-lucide="flame" class="w-3 h-3"></i> ${recipe.cookTime}m cook</span>` : ''}
                                    ${recipe.servings ? `<span class="flex items-center gap-1"><i data-lucide="users" class="w-3 h-3"></i> ${recipe.servings}</span>` : ''}
                                </div>
                                <div class="mt-4">
                                    <div class="flex min-h-[2rem] flex-wrap content-start gap-2">
                                        <span class="text-[10px] bg-accent text-sage font-bold px-2 py-1 rounded-sm uppercase tracking-wider border border-sage border-opacity-20">${recipe.category || 'Misc'}</span>
                                        ${recipe.difficulty ? `<span class="text-[10px] bg-gold bg-opacity-20 text-sage font-bold px-2 py-1 rounded-sm">${recipe.difficulty}</span>` : ''}
                                        ${recipe.cuisine ? `<span class="text-[10px] bg-accent text-sage font-bold px-2 py-1 rounded-sm uppercase tracking-wider border border-sage border-opacity-20">${recipe.cuisine}</span>` : ''}
                                    </div>
                                    <div class="mt-2 flex min-h-[1.5rem] flex-wrap content-start gap-1">
                                        ${recipe.diet && recipe.diet.length > 0 ? recipe.diet.map(d => `<span class="text-[9px] bg-sage bg-opacity-10 text-sage font-bold px-1.5 py-0.5 rounded">${d}</span>`).join('') : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
            }

            contentDiv.innerHTML = html;
            lucide.createIcons();
        }

        function renderPublishedRecipeDetail(publishedRecipeId) {
            const recipe = publishedRecipesCache.find(item => item.id === publishedRecipeId);
            if (!recipe) {
                showToast('Recipe not found in Browse', 'alert-circle');
                renderBrowse();
                return;
            }

            setActiveNav('browse');

            const saved = isPublishedRecipeSaved(recipe.id);
            const owned = isPublishedRecipeOwnedByCurrentUser(recipe);
            const headerBg = recipe.profile || defaultPlaceholderProfile;
            const versionLabel = getPublishedVersionLabel(recipe);
            const ownedLocalRecipe = getLocalRecipeByPublishedId(recipe.id);

            contentDiv.innerHTML = `
                <div class="bg-white rounded-sm shadow-sm mb-6 border border-parchmentDark relative w-full overflow-hidden">
                    <div class="absolute top-4 left-4 right-4 flex justify-between z-10 pointer-events-none">
                        <button onclick="renderBrowse()" class="pointer-events-auto bg-forest text-white w-14 h-14 flex items-center justify-center rounded-sm shadow-xl hover:bg-sage transition-all hover:scale-105 border-2 border-white"><i data-lucide="arrow-left" class="w-6 h-6"></i></button>
                        ${owned ? `
                            <div class="pointer-events-auto flex flex-wrap items-center justify-end gap-2">
                                ${ownedLocalRecipe ? `<button onclick="renderDetail(${ownedLocalRecipe.id})" class="bg-white text-forest px-4 h-14 rounded-sm font-bold flex items-center gap-2 shadow-xl hover:bg-accent transition-all border-2 border-white uppercase tracking-wider text-xs"><i data-lucide="book-open" class="w-4 h-4"></i>Open local</button>` : ''}
                                <span class="inline-flex items-center rounded-full bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.24em] text-sage shadow-xl border border-white">Published by you${versionLabel ? ` Â· ${versionLabel}` : ''}</span>
                            </div>
                        ` : `<button onclick="toggleSavedPublishedRecipe('${recipe.id}', 'detail')" class="pointer-events-auto bg-white ${saved ? 'text-red-500' : 'text-sage'} px-5 h-14 rounded-sm font-bold flex items-center gap-2 shadow-xl hover:bg-accent transition-all border-2 border-white uppercase tracking-wider text-xs"><i data-lucide="heart" class="w-5 h-5 ${saved ? 'fill-current' : ''}"></i>${saved ? 'Saved to Index' : 'Save to Index'}</button>`}
                    </div>

                    <div class="w-full h-48 md:h-64 relative overflow-hidden bg-forest">
                        <div class="absolute inset-0 bg-cover bg-center opacity-40 blur-sm scale-110" style="background-image: url('${headerBg}')"></div>
                        <div class="absolute inset-0 bg-gradient-to-t from-forest to-transparent opacity-80"></div>
                        <div class="absolute bottom-0 left-0 w-full p-6 md:p-10 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                            <div class="w-32 h-32 md:w-40 md:h-40 rounded-sm border-4 border-white shadow-2xl bg-cover bg-center flex-shrink-0 z-10 transform translate-y-12 md:translate-y-16" style="background-image: url('${recipe.profile || defaultPlaceholderProfile}')"></div>
                            <div class="text-white z-10 pb-2 md:pb-0">
                                <h2 class="font-fantasy font-bold text-4xl md:text-5xl mb-2 text-shadow-sm drop-shadow-md">${recipe.title}</h2>
                                <div class="flex items-center justify-center md:justify-start gap-4 text-xs md:text-sm font-bold uppercase tracking-wider opacity-90">
                                    <span class="flex items-center gap-1"><i data-lucide="user" class="w-4 h-4"></i> ${recipe.authorName || recipe.author || 'Chef'}</span><span>|</span><span class="flex items-center gap-1">${recipe.country || 'Community'}</span>${versionLabel ? `<span>|</span><span class="flex items-center gap-1">${versionLabel}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="h-16 md:h-20 w-full bg-white"></div>

                    <div class="p-6 md:p-10">
                        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 p-4 bg-accent bg-opacity-30 rounded-md border border-sage border-opacity-10">
                            ${recipe.prepTime ? `<div class="text-center"><div class="flex justify-center mb-2"><i data-lucide="clock" class="w-5 h-5 text-gold"></i></div><div class="text-xs uppercase font-bold text-sage">Prep</div><div class="text-lg font-bold text-forest">${recipe.prepTime}m</div></div>` : ''}
                            ${recipe.cookTime ? `<div class="text-center"><div class="flex justify-center mb-2"><i data-lucide="flame" class="w-5 h-5 text-gold"></i></div><div class="text-xs uppercase font-bold text-sage">Cook</div><div class="text-lg font-bold text-forest">${recipe.cookTime}m</div></div>` : ''}
                            ${recipe.servings ? `<div class="text-center"><div class="flex justify-center mb-2"><i data-lucide="users" class="w-5 h-5 text-gold"></i></div><div class="text-xs uppercase font-bold text-sage">Servings</div><div class="text-lg font-bold text-forest">${recipe.servings}</div></div>` : ''}
                            ${recipe.difficulty ? `<div class="text-center"><div class="flex justify-center mb-2"><i data-lucide="zap" class="w-5 h-5 text-gold"></i></div><div class="text-xs uppercase font-bold text-sage">Difficulty</div><div class="text-lg font-bold text-forest">${recipe.difficulty}</div></div>` : ''}
                            ${recipe.cuisine ? `<div class="text-center"><div class="flex justify-center mb-2"><i data-lucide="globe" class="w-5 h-5 text-gold"></i></div><div class="text-xs uppercase font-bold text-sage">Cuisine</div><div class="text-lg font-bold text-forest">${recipe.cuisine}</div></div>` : ''}
                        </div>
                        ${(recipe.diet && recipe.diet.length > 0) || versionLabel ? `<div class="mb-6 flex flex-wrap gap-2">${recipe.diet && recipe.diet.length > 0 ? `<span class="text-xs uppercase font-bold text-sage">Diet:</span>${recipe.diet.map(d => `<span class="text-[10px] bg-gold bg-opacity-20 text-sage font-bold px-2 py-1 rounded-sm">${d}</span>`).join('')}` : ''}${versionLabel ? `<span class="text-[10px] bg-white text-sage font-bold px-2 py-1 rounded-sm uppercase tracking-[0.16em] border border-parchmentDark">${versionLabel}</span>` : ''}</div>` : ''}

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                            <div class="md:col-span-1 bg-accent bg-opacity-30 p-6 rounded-md border border-sage border-opacity-10 h-fit">
                                <h3 class="font-bold font-fantasy text-2xl flex items-center text-forest mb-6 pb-3 border-b border-sage border-opacity-20"><i data-lucide="shopping-basket" class="w-6 h-6 mr-2 text-gold"></i> Ingredients</h3>
                                <ul class="text-sm space-y-2">
                                    ${(recipe.ingredients || []).map(ing => `<li class="flex items-center bg-white rounded-md shadow-sm border border-transparent p-3"><span class="text-forest font-semibold text-sm leading-snug">${applyMeasurementSystem(ing)}</span></li>`).join('')}
                                </ul>
                            </div>

                            <div class="md:col-span-2">
                                <h3 class="font-bold font-fantasy text-3xl mb-6 flex items-center text-forest border-b border-accent pb-3"><i data-lucide="list-ordered" class="w-7 h-7 mr-3 text-gold"></i> Instructions</h3>
                                <ol class="space-y-4">
                                    ${(recipe.instructions || []).map((step, index) => {
                                        const stepImage = getRecipeInstructionImage(step);
                                        return `
                                            <li class="flex gap-4 items-start p-4 rounded-md border border-sage border-opacity-10 bg-white">
                                                <span class="flex items-center justify-center w-8 h-8 rounded-sm bg-sage text-white font-bold text-sm shadow-sm flex-shrink-0">${index + 1}</span>
                                                <div class="flex-1">
                                                    <p class="text-forest font-medium text-base leading-relaxed pt-1">${applyMeasurementSystem(getRecipeInstructionText(step))}</p>
                                                    ${stepImage ? `<div class="mt-4 overflow-hidden rounded-md border border-parchmentDark bg-parchment"><img src="${stepImage}" alt="Instruction step ${index + 1}" class="h-48 w-full object-cover"></div>` : ''}
                                                </div>
                                            </li>
                                        `;
                                    }).join('')}
                                </ol>
                            </div>
                        </div>

                        ${recipe.tips ? `
                            <div class="mt-12 w-full bg-sage bg-opacity-10 p-6 md:p-8 rounded-md border-l-4 border-gold shadow-inner">
                                <h3 class="font-bold font-fantasy text-2xl mb-4 flex items-center text-forest"><i data-lucide="lightbulb" class="w-6 h-6 mr-2 text-gold"></i> Chef's Notes</h3>
                                <p class="text-base font-semibold text-forest leading-relaxed">${applyMeasurementSystem(recipe.tips)}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
            lucide.createIcons();
        }

        // --- TIMER FUNCTIONS ---
        let timerInterval = null;
        let timerElement = null;

        function startStepTimer(minutes) {
            if (!Number.isInteger(minutes) || minutes <= 0) {
                showToast('Enter valid time in minutes', 'alert-circle');
                return;
            }

            let secondsLeft = minutes * 60;
            const modal = document.getElementById('timer-modal');
            const display = document.getElementById('timer-display');
            const finalBtn = document.getElementById('timer-final-btn');

            if (modal) modal.classList.remove('hidden', 'opacity-0', 'scale-95');

            function updateDisplay() {
                const mins = Math.floor(secondsLeft / 60);
                const secs = secondsLeft % 60;
                if (display) {
                    display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                }
            }

            updateDisplay();

            if (timerInterval) clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                secondsLeft--;
                updateDisplay();

                if (secondsLeft === 0) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    if (modal) {
                        modal.classList.add('hidden');
                    }
                    showToast('Time\'s up!', 'bell');
                    
                    // Play sound if available
                    try {
                        const beep = new AudioContext();
                        const osc = beep.createOscillator();
                        osc.connect(beep.destination);
                        osc.frequency.value = 800;
                        osc.start();
                        setTimeout(() => osc.stop(), 100);
                    } catch (e) {}
                }
            }, 1000);
        }

        function closeTimer() {
            if (timerInterval) clearInterval(timerInterval);
            const modal = document.getElementById('timer-modal');
            if (modal) modal.classList.add('hidden', 'opacity-0', 'scale-95');
        }

        function showPremiumModal(featureName) {
            createModal("Unlock Uculi Premium", `
                <div class="p-6 text-center bg-white">
                    <div class="w-16 h-16 bg-gold bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold">
                        <i data-lucide="crown" class="w-8 h-8 text-gold"></i>
                    </div>
                    <h3 class="text-2xl font-fantasy font-bold text-forest mb-2">Premium Feature</h3>
                    <p class="text-sage mb-6 text-sm font-semibold">You need Premium to \${featureName}. Subscribe to supercharge your notebook and support Uculi!</p>
                    
                    <div class="space-y-3 text-left bg-parchment p-4 rounded-md border border-parchmentDark mb-6">
                        <p class="flex items-center gap-2 text-sm text-forest font-bold"><i data-lucide="check" class="w-4 h-4 text-gold"></i> Unlimited Local Recipes</p>
                        <p class="flex items-center gap-2 text-sm text-forest font-bold"><i data-lucide="check" class="w-4 h-4 text-gold"></i> Connect with Families</p>
                        <p class="flex items-center gap-2 text-sm text-forest font-bold"><i data-lucide="check" class="w-4 h-4 text-gold"></i> Cloud Sync & Publishing</p>
                        <p class="flex items-center gap-2 text-sm text-forest font-bold"><i data-lucide="check" class="w-4 h-4 text-gold"></i> Custom Notebook Covers</p>
                        <p class="flex items-center gap-2 text-sm text-forest font-bold opacity-60 italic"><i data-lucide="sparkles" class="w-4 h-4 text-gold"></i> Future: Live Shopping List</p>
                    </div>

                    <button onclick="simulatePremiumUpgrade()" class="w-full bg-forest text-white h-12 rounded-md font-bold uppercase tracking-wider hover:bg-opacity-90 flex items-center justify-center gap-2 transition-colors mb-3">
                        Subscribe Now (Pricing TBD)
                    </button>
                    <button onclick="closeModal()" class="w-full text-xs text-sage uppercase tracking-wider font-bold hover:text-forest transition-colors">
                        Maybe Later
                    </button>
                </div>
            `);
        }

        window.simulatePremiumUpgrade = function() {
            userSettings.premium = true;
            saveData();
            closeModal();
            showToast("Welcome to Uculi Premium!", "crown");
            if (currentNav === "settings") renderSettings();
            if (currentNav === "profile") renderProfile();
        };

        function createModal(title, contentHTML, buttons = []) {
            const modalId = 'dynamic-modal-' + Date.now();
            const modalHtml = `
                <div id="${modalId}" class="fixed inset-0 bg-black bg-opacity-60 hidden opacity-0 transition-opacity z-[100] flex items-center justify-center p-4">
                    <div class="bg-white rounded-sm shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-parchmentDark scale-95 transition-transform" id="${modalId}-content">
                        <div class="p-4 md:p-6 border-b border-parchmentDark flex items-center justify-between bg-parchment shrink-0">
                            <h2 class="font-serif font-bold text-xl md:text-2xl text-forest">${title}</h2>
                            <button onclick="closeModal('${modalId}')" class="text-sage hover:text-coral transition-colors p-1">
                                <i data-lucide="x" class="w-5 h-5"></i>
                            </button>
                        </div>
                        <div class="p-4 md:p-6 overflow-y-auto grow">
                            ${contentHTML}
                        </div>
                        ${buttons.length ? `
                        <div class="p-4 md:p-6 border-t border-parchmentDark bg-parchment shrink-0 flex items-center justify-end gap-3 flex-wrap">
                            ${buttons.map((btn, idx) => {
                                const clickFn = btn.onClick || btn.onclick;
                                if (clickFn) window[`dynamic-modal-btn-${modalId}-${idx}`] = clickFn;
                                return `
                                    <button onclick="${clickFn ? `window['dynamic-modal-btn-${modalId}-${idx}']()` : `closeModal('${modalId}')`}" 
                                        class="px-5 py-2.5 rounded-sm font-bold shadow-sm transition-colors uppercase tracking-wider text-sm ${btn.primary ? 'bg-forest text-white hover:bg-sage' : (btn.danger ? 'bg-white border border-coral text-coral hover:bg-coral hover:text-white' : 'bg-white border border-parchmentDark text-forest hover:bg-parchmentDark')}">
                                        ${btn.text}
                                    </button>
                                `;
                            }).join('')}
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            lucide.createIcons();
            
            const modal = document.getElementById(modalId);
            const content = document.getElementById(`${modalId}-content`);
            
            requestAnimationFrame(() => {
                modal.classList.remove('hidden');
                requestAnimationFrame(() => {
                    modal.classList.remove('opacity-0');
                    content.classList.remove('scale-95');
                });
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal(modalId);
            });
        }

        function closeModal(modalId) {
            const modals = document.querySelectorAll('[id^="dynamic-modal-"]');
            const targetModal = modalId ? document.getElementById(modalId) : modals[modals.length - 1];
            
            if (targetModal) {
                const content = document.getElementById(`${targetModal.id}-content`);
                targetModal.classList.add('opacity-0');
                if (content) content.classList.add('scale-95');
                
                setTimeout(() => {
                    targetModal.remove();
                }, 300);
            }
        }

        // --- FAMILY RECIPE BOOKS ---
        function showCreateFamilyModal() { if(!userSettings.premium) { showPremiumModal("create families"); return; }
            if (!isAuthenticated) return showToast('Please sign in to create a family.', 'alert-circle', true);
            const activeFamilies = userFamilies.filter(f => !f.removedMembers || !f.removedMembers.some(m => m.userId === currentUser.uid));
            if (activeFamilies.length >= 3) {
                return showToast('You can only be an active member of 3 families at once.', 'alert-circle', true);
            }

            createModal('Create Family Book', `
                <div class="space-y-4 text-inkDark">
                    <p class="text-sm text-sage mb-4">Create a new family to share recipes with your real or chosen family. You will be the admin.</p>
                    <div>
                        <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-1">Family Name</label>
                        <input type="text" id="new-family-name" placeholder="e.g. Smith Family" class="w-full bg-parchment border border-parchmentDark rounded-sm px-4 py-3 outline-none focus:border-sage transition-colors text-forest font-bold" maxlength="25">
                    </div>
                    <div>
                        <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-1">Secret Pincode</label>
                        <input type="text" id="new-family-pin" placeholder="Enter a 4-8 digit pin" class="w-full bg-parchment border border-parchmentDark rounded-sm px-4 py-3 outline-none focus:border-sage transition-colors text-forest font-bold" maxlength="8">
                        <p class="text-[10px] text-sage mt-1">Users will need this pin to join the family.</p>
                    </div>
                </div>
            `, [
                { text: 'Cancel', onClick: () => closeModal() },
                { text: 'Create Family', primary: true, onClick: () => {
                    const name = document.getElementById('new-family-name').value.trim();
                    const pin = document.getElementById('new-family-pin').value.trim();
                    if (!name || !pin) return showToast('Please fill out all fields.', 'alert-circle', true);
                    if (pin.length < 4) return showToast('Pincode must be at least 4 characters.', 'alert-circle', true);
                    submitCreateFamily(name, pin);
                    closeModal();
                }}
            ]);
        }

        function showJoinFamilyModal() { if(!userSettings.premium) { showPremiumModal("join families"); return; }
            if (!isAuthenticated) return showToast('Please sign in to join a family.', 'alert-circle', true);
            
            const activeFamilies = userFamilies.filter(f => !f.removedMembers || !f.removedMembers.some(m => m.userId === currentUser.uid));
            if (activeFamilies.length >= 3) {
                return showToast('You can only be an active member of 3 families at once.', 'alert-circle', true);
            }

            createModal('Join Family Book', `
                <div class="space-y-4 text-inkDark">
                    <p class="text-sm text-sage mb-4">Join an existing family book using their exact name, tag, and pincode.</p>
                    <div class="flex gap-2">
                        <div class="flex-grow">
                            <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-1">Family Name</label>
                            <input type="text" id="join-family-name" placeholder="e.g. Smith" class="w-full bg-parchment border border-parchmentDark rounded-sm px-4 py-3 outline-none focus:border-sage transition-colors text-forest font-bold">
                        </div>
                        <div class="w-24">
                            <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-1">Tag #</label>
                            <input type="text" id="join-family-tag" placeholder="1234" class="w-full bg-parchment border border-parchmentDark rounded-sm px-4 py-3 outline-none focus:border-sage transition-colors text-forest font-bold" maxlength="4">
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-1">Secret Pincode</label>
                        <input type="text" id="join-family-pin" placeholder="Enter the family pin" class="w-full bg-parchment border border-parchmentDark rounded-sm px-4 py-3 outline-none focus:border-sage transition-colors text-forest font-bold" maxlength="8">
                    </div>
                </div>
            `, [
                { text: 'Cancel', onClick: () => closeModal() },
                { text: 'Join Family', primary: true, onClick: () => {
                    const name = document.getElementById('join-family-name').value.trim();
                    const tag = document.getElementById('join-family-tag').value.trim();
                    const pin = document.getElementById('join-family-pin').value.trim();
                    
                    if (!name || !tag || !pin) return showToast('Please fill out all fields.', 'alert-circle', true);
                    submitJoinFamily(name, tag, pin);
                    closeModal();
                }}
            ]);
        }

        async function submitCreateFamily(name, pin) {
            showToast('Creating family...', 'loader');
            const tag = Math.floor(1000 + Math.random() * 9000).toString();
            
            const newFamily = {
                id: 'fam_' + Date.now(),
                name: name,
                tag: tag,
                pinCode: pin,
                creatorId: currentUser.uid,
                memberIds: [currentUser.uid],
                removedMembers: []
            };
            
            userFamilies.push(newFamily);
            showToast('Family created! Invite others with tag #' + tag, 'check');
            renderProfile(); 
        }

        async function submitJoinFamily(name, tag, pin) {
            showToast('Joining family feature will reconnect on Firebase.', 'cloud-off');
        }

        function showFamilyDetails(familyId) {
            const family = userFamilies.find(f => f.id === familyId);
            if (!family) return;

            const isRemoved = family.removedMembers && family.removedMembers.some(m => m.userId === currentUser?.uid);
            const isCreator = family.creatorId === currentUser?.uid;

            const membersHtml = family.memberIds.map(uid => `
                <div class="flex items-center justify-between p-3 border-b border-parchmentDark last:border-0 hover:bg-white transition-colors group">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-bold text-xs uppercase">
                            ${uid === currentUser?.uid ? 'ME' : 'U'}
                        </div>
                        <div>
                            <p class="font-bold text-forest text-sm">${uid === currentUser?.uid ? 'You' : 'Family Member'}</p>
                            <p class="text-[10px] text-sage uppercase tracking-wider">${uid === family.creatorId ? 'Admin' : 'Member'}</p>
                        </div>
                    </div>
                    ${(isCreator && uid !== currentUser?.uid) ? `
                        <button onclick="removeFamilyMember('${family.id}', '${uid}')" class="text-sage opacity-0 group-hover:opacity-100 hover:text-coral transition-all p-1.5 rounded-sm" title="Remove Member">
                            <i data-lucide="user-minus" class="w-4 h-4"></i>
                        </button>
                    ` : ''}
                </div>
            `).join('');

            createModal(`${family.name} <span class="text-sage font-normal text-sm opacity-60">#${family.tag}</span>`, `
                <div class="space-y-6 text-inkDark max-h-[60vh] overflow-y-auto w-[650px] max-w-[90vw]">
                    ${isRemoved ? `
                        <div class="bg-coral text-white p-4 rounded-sm flex gap-3 text-sm shadow-sm mb-6 border border-coral/20">
                            <i data-lucide="alert-triangle" class="w-5 h-5 shrink-0 mt-0.5"></i>
                            <div>
                                <p class="font-bold mb-1">You are no longer an active member.</p>
                                <p class="opacity-90">You have read-only access to this family's recipes to back them up via PDF export. This access will expire automatically 30 days after removal.</p>
                            </div>
                        </div>
                    ` : ''}

                    <div>
                        <h4 class="text-xs uppercase tracking-wide font-bold text-sage mb-3 flex justify-between items-end">
                            <span>Members (${family.memberIds.length})</span>
                            ${isCreator ? '<span class="text-[10px] font-normal opacity-70">You can manage members</span>' : ''}
                        </h4>
                        <div class="bg-parchment rounded-sm border border-parchmentDark">
                            ${membersHtml}
                        </div>
                    </div>

                    ${!isRemoved ? `
                        <div class="bg-white p-5 border border-parchmentDark rounded-sm shadow-sm">
                            <h4 class="text-xs uppercase tracking-wide font-bold text-sage mb-2 flex items-center justify-between">
                                Invite Others
                                <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
                            </h4>
                            <p class="text-sm text-forest opacity-80 mb-4">Share your exact family name, tag, and pincode so loved ones can search and join your book. They will need all three parts.</p>
                            <button onclick="shareFamilyInvite('${family.name}', '${family.tag}', '${family.pinCode || 'Hidden'}')" class="w-full bg-forest text-white hover:bg-sage h-12 rounded-sm font-bold shadow-md transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-[13px]">
                                Share Invite Link
                            </button>
                        </div>
                    ` : ''}
                </div>
            `, [
                { text: 'Close', onClick: () => closeModal() },
                (!isRemoved && !isCreator) ? { text: 'Leave Family', danger: true, onClick: () => handleLeaveFamily(family.id) } : null
            ].filter(Boolean));
        }

        async function shareFamilyInvite(name, tag, pin) {
            const shareText = `Cook with me on Uculi!\n\nSearch my family book in the Profile section.\nFamily: ${name}\nTag: #${tag}\nPincode: ${pin}`;
            
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'Join our Recipe Book',
                        text: shareText
                    });
                } catch (err) {
                    console.log('Share failed:', err);
                }
            } else {
                navigator.clipboard.writeText(shareText);
                showToast('Invite copied to clipboard!', 'clipboard-copy');
            }
        }

        async function removeFamilyMember(familyId, userId) {
            if (!confirm('Are you sure you want to remove this member? They will have a 30-day grace period to download their shared recipes before losing access permanently.')) return;
            
            const fam = userFamilies.find(f => f.id === familyId);
            if (fam) {
                fam.memberIds = fam.memberIds.filter(id => id !== userId);
                if (!fam.removedMembers) fam.removedMembers = [];
                fam.removedMembers.push({
                    userId: userId,
                    removedAt: Date.now(),
                    acknowledged: false
                });
                
                showToast('Member removed successfully.', 'user-minus');
                closeModal();
                showFamilyDetails(familyId); // refresh
                renderProfile();
            }
        }

        async function handleLeaveFamily(familyId) {
            if (!confirm('Are you sure you want to leave this family? You will instantly lose access to all family recipes, and all your recipes shared to this family will be withdrawn.')) return;

            const fam = userFamilies.find(f => f.id === familyId);
            if (fam) {
                fam.memberIds = fam.memberIds.filter(id => id !== currentUser.uid);
                showToast('Left family successfully.', 'log-out');
                closeModal();
                renderProfile();
            }
        }

        // --- BACKGROUND CHECKS ---
        function checkFamilyRemovals() {
            if (!currentUser) return;
            
            // Look for any unacknowledged removals
            const unacknowledged = [];
            userFamilies.forEach(fam => {
                if (fam.removedMembers) {
                    const entry = fam.removedMembers.find(m => m.userId === currentUser.uid && !m.acknowledged);
                    if (entry) unacknowledged.push({ fam, entry });
                }
            });

            if (unacknowledged.length > 0) {
                const names = unacknowledged.map(u => u.fam.name).join(', ');
                createModal('Family Membership Update', `
                    <div class="space-y-4">
                        <div class="bg-coral text-white p-4 rounded-sm flex gap-3 text-sm shadow-sm mb-2 border border-coral/20">
                            <i data-lucide="alert-triangle" class="w-6 h-6 shrink-0 mt-0.5"></i>
                            <div>
                                <p class="font-bold text-lg mb-1">You were removed</p>
                                <p class="opacity-90 leading-relaxed">You have been removed from the following family group(s): <strong>${names}</strong>.</p>
                            </div>
                        </div>
                        <p class="text-sm text-forest font-semibold mt-4">You have a 30-day grace period from the date of removal to view and download (PDF) your favorite shared recipes, or duplicate them to your own account. After 30 days, your access will be permanently revoked.</p>
                        <p class="text-sm text-sage mt-2">Any recipes that you originally created and shared to this family have automatically been withdrawn from the group and return solely to you.</p>
                    </div>
                `, [{ text: 'I Understand', primary: true, onClick: () => {
                    unacknowledged.forEach(u => u.entry.acknowledged = true);
                    closeModal();
                }}]);
            }
        }

        // --- FAVORITES & RATINGS ---
        function toggleFavorite(recipeId) {
            const recipe = recipes.find(r => r.id === recipeId);
            if (!recipe) return;

            if (isRecipeAlwaysFavorite(recipe)) {
                showToast('Your own recipes always stay in favorites.', 'heart');
                return;
            }

            if (!userSettings.favorites) userSettings.favorites = [];
            const index = userSettings.favorites.indexOf(recipeId);
            if (index === -1) {
                userSettings.favorites.push(recipeId);
                showToast('Added to favorites!', 'heart');
            } else {
                userSettings.favorites.splice(index, 1);
                showToast('Removed from favorites', 'x-circle');
            }
            saveData();
            const btn = document.getElementById(`fav-btn-${recipeId}`);
            if (btn) {
                btn.classList.toggle('text-red-500');
                btn.classList.toggle('text-sage');
                lucide.createIcons();
            }
        }

        function setRating(recipeId, stars) {
            const recipe = recipes.find(r => r.id === recipeId);
            if (!recipe) return;
            if (!canRateRecipe(recipe)) {
                showToast('You cannot rate your own recipes.', 'star-off');
                return;
            }

            if (!userSettings.myRecipeRatings) userSettings.myRecipeRatings = {};
            userSettings.myRecipeRatings[recipeId] = stars;
            saveData();
            updateRatingDisplay(recipeId);
            showToast(`Rated ${stars} stars!`, 'star');
        }

        function updateRatingDisplay(recipeId) {
            const rating = userSettings.myRecipeRatings?.[recipeId] || 0;
            document.querySelectorAll(`.rating-star-${recipeId}`).forEach((star, idx) => {
                if (idx < rating) {
                    star.classList.remove('opacity-30');
                } else {
                    star.classList.add('opacity-30');
                }
            });
        }
        // --- PERSONAL NOTES ---
        function openNotesEditor(recipeId) {
            const recipe = recipes.find(r => r.id === recipeId);
            if (!recipe) return;
            
            const currentNotes = recipe.personalNotes || '';
            const modal = document.getElementById('notes-modal');
            const textarea = document.getElementById('notes-textarea');
            const saveBtn = document.getElementById('notes-save-btn');
            
            textarea.value = currentNotes;
            modal.classList.remove('hidden', 'opacity-0', 'scale-95');
            saveBtn.onclick = () => savePersonalNotes(recipeId);
        }
        
        function closeNotesEditor() {
            const modal = document.getElementById('notes-modal');
            modal.classList.add('hidden', 'opacity-0', 'scale-95');
        }
        
        function savePersonalNotes(recipeId) {
            const recipe = recipes.find(r => r.id === recipeId);
            if (!recipe) return;
            
            const textarea = document.getElementById('notes-textarea');
            recipe.personalNotes = textarea.value;
            saveData();
            closeNotesEditor();
            showToast('Notes saved!', 'check-circle');
            if (currentView === 'index' && indexViewMode === 'book') {
                renderList();
                return;
            }
            const notesSection = document.getElementById(`notes-section-${recipeId}`);
            if (notesSection) {
                notesSection.innerHTML = recipe.personalNotes ? `<p class="text-sm text-forest mb-2"><strong>Your notes:</strong> ${recipe.personalNotes}</p>` : '';
            }
        }
        function renderDetail(id) {
            const recipe = recipes.find(r => r.id === id);
            if (!recipe) return;

            setActiveNav('index');
            check12HourReset(recipe);
            currentScale = 1;

            const headerBg = recipe.profile || defaultPlaceholderProfile;
            const isSavedCommunityRecipe = recipe.source === 'published';
            const isOwnedRecipe = isRecipeOwnedByCurrentUser(recipe);
            const canEditExistingRecipe = isRecipeEditable(recipe);
            const recipeIsFavorited = isRecipeFavorited(recipe);
            const recipeCanBeRated = canRateRecipe(recipe);
            const recipeLocationLabel = isSavedCommunityRecipe ? 'Saved from Browse' : 'Created by you';
            const recipeVersionLabel = getPublishedVersionLabel(recipe);
            const recipeIsLive = isRecipePublishedLive(recipe);
            const recipeHasUnpublishedChanges = hasRecipeChangesSincePublish(recipe);
            const publishActionLabel = getPublishActionLabel(recipe);
            const latestPublishedRecipe = isSavedCommunityRecipe ? getPublishedRecipeFromCache(recipe.publishedId) : null;
            const savedRecipeIsOutdated = isSavedCommunityRecipe ? isSavedPublishedRecipeOutdated(recipe) : false;
            const savedRecipeSourceRetracted = Boolean(isSavedCommunityRecipe && latestPublishedRecipe?.publicationState === 'retracted');
            const latestPublishedVersionLabel = latestPublishedRecipe ? getPublishedVersionLabel(latestPublishedRecipe) : '';
            const instructionCount = (recipe.instructions || []).length;
            const nextUnfinishedStepIndex = instructionCount > 0
                ? (recipe.instructions || []).findIndex((_, index) => !(recipe.checkedSteps || []).includes(index))
                : -1;
            const remainingStepCount = instructionCount > 0
                ? Math.max(0, instructionCount - ((recipe.checkedSteps || []).length || 0))
                : 0;
            const nextStepText = nextUnfinishedStepIndex >= 0
                ? applyMeasurementSystem(getRecipeInstructionText(recipe.instructions[nextUnfinishedStepIndex]))
                : '';
            const nextStepPreview = nextStepText.length > 140 ? `${nextStepText.slice(0, 137)}...` : nextStepText;
            const cookingSummary = instructionCount === 0
                ? 'Add instructions to unlock cooking mode.'
                : (nextUnfinishedStepIndex === -1
                    ? `All ${instructionCount} steps are checked off. You can re-read from step 1 or uncheck a step to continue.`
                    : `${remainingStepCount} step${remainingStepCount === 1 ? '' : 's'} left. Next up: ${escapeHTML(nextStepPreview)}`);
            const focusSecondaryActionClass = 'inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-parchmentDark bg-white px-4 text-[11px] font-bold uppercase tracking-[0.16em] shadow-sm transition-all';
            const focusPrimaryActionClass = 'inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-gold bg-gold px-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-sm transition-all hover:border-yellow-600 hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-60';
            const primarySupportAction = canEditExistingRecipe
                ? `<button onclick="renderAddForm(${recipe.id})" class="${focusSecondaryActionClass} text-forest hover:border-gold hover:text-sage" translate="no"><i data-lucide="pencil-line" class="h-4 w-4 text-gold"></i>Edit recipe</button>`
                : `<button onclick="renderPublishedRecipeDetail('${recipe.publishedId}')" class="${focusSecondaryActionClass} text-forest hover:border-gold hover:text-sage"><i data-lucide="external-link" class="h-4 w-4 text-gold"></i>${savedRecipeIsOutdated ? 'Open latest' : 'Browse original'}</button>`;

            if (isSavedCommunityRecipe) {
                queuePublishedRecipeStatusRefresh(recipe.id, recipe.publishedId);
            }

            contentDiv.innerHTML = `
                <div class="detail-shell bg-white rounded-sm shadow-sm mb-6 border border-parchmentDark relative w-full overflow-hidden">
                    <div class="detail-hero-shell w-full h-48 md:h-64 relative overflow-hidden bg-forest">
                        <div class="absolute inset-0 bg-cover bg-center opacity-40 blur-sm scale-110" style="background-image: url('${headerBg}')"></div>
                        <div class="absolute inset-0 bg-gradient-to-t from-forest to-transparent opacity-80"></div>
                        <div class="absolute bottom-0 left-0 w-full p-6 md:p-10 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                            <div class="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-white shadow-2xl bg-cover bg-center flex-shrink-0 z-10 transform translate-y-16 md:translate-y-20" style="background-image: url('${headerBg}')"></div>
                            <div class="text-white z-10 pb-2 md:pb-0">
                                <p class="text-[11px] font-bold uppercase tracking-[0.32em] opacity-80">${recipeLocationLabel}</p>
                                <h2 class="font-fantasy font-bold text-4xl md:text-5xl mb-2 text-shadow-sm drop-shadow-md">${recipe.title}</h2>
                                <div class="flex items-center justify-center md:justify-start gap-4 text-xs md:text-sm font-bold uppercase tracking-wider opacity-90 flex-wrap">
                                    <span class="flex items-center gap-1"><i data-lucide="user" class="w-4 h-4"></i> ${recipe.author}</span>
                                    <span>|</span>
                                    <span class="flex items-center gap-1"><i data-lucide="map-pinned" class="w-4 h-4"></i> ${recipe.country || 'Unknown'}</span>
                                    ${isSavedCommunityRecipe ? `<span>|</span><span class="flex items-center gap-1"><i data-lucide="heart" class="w-4 h-4"></i> Community save${recipeVersionLabel ? ` ${recipeVersionLabel}` : ''}</span>` : ''}
                                    ${!isSavedCommunityRecipe && recipe.publishedId ? `<span>|</span><span class="flex items-center gap-1"><i data-lucide="${recipeIsLive ? 'cloud' : 'cloud-off'}" class="w-4 h-4"></i> ${recipeIsLive ? 'Live in Browse' : 'Removed from Browse'}${recipeVersionLabel ? ` ${recipeVersionLabel}` : ''}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="h-16 md:h-20 w-full bg-white"></div>

                    <div class="detail-content-shell p-6 md:p-10">
                        <div class="detail-cooking-focus mb-8 rounded-2xl border border-parchmentDark bg-gradient-to-r from-white via-parchment to-accent p-5 shadow-sm">
                            <div class="flex flex-col gap-5">
                                <div class="space-y-2 max-w-3xl">
                                    <p class="text-[11px] font-bold uppercase tracking-[0.28em] text-sage opacity-80">Cook without hunting through the page</p>
                                    <h3 class="font-fantasy text-2xl font-bold text-forest">Focused cooking flow</h3>
                                    <p class="text-sm font-semibold leading-relaxed text-sage">${cookingSummary}</p>
                                </div>
                                <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                                    <button onclick="renderList()" class="${focusSecondaryActionClass} text-sage hover:border-gold hover:text-forest" translate="no"><i data-lucide="arrow-left" class="h-4 w-4"></i>Back to index</button>
                                    ${primarySupportAction}
                                    <button onclick="toggleCookingMode(${recipe.id})" class="${focusPrimaryActionClass} sm:col-span-2 lg:col-span-1" ${instructionCount === 0 ? 'disabled' : ''} translate="no">
                                        <i id="focus-btn-icon" data-lucide="chef-hat" class="h-4 w-4"></i><span id="focus-btn-text">Start Cooking</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="detail-meta-grid grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 p-4 bg-accent bg-opacity-30 rounded-md border border-sage border-opacity-10">
                            ${recipe.prepTime ? `<div class="text-center"><div class="flex justify-center mb-2"><i data-lucide="clock" class="w-5 h-5 text-gold"></i></div><div class="text-xs uppercase font-bold text-sage">Prep</div><div class="text-lg font-bold text-forest">${recipe.prepTime}m</div></div>` : ''}
                            ${recipe.cookTime ? `<div class="text-center"><div class="flex justify-center mb-2"><i data-lucide="flame" class="w-5 h-5 text-gold"></i></div><div class="text-xs uppercase font-bold text-sage">Cook</div><div class="text-lg font-bold text-forest">${recipe.cookTime}m</div></div>` : ''}
                            ${recipe.servings ? `<div class="text-center"><div class="flex justify-center mb-2"><i data-lucide="users" class="w-5 h-5 text-gold"></i></div><div class="text-xs uppercase font-bold text-sage">Servings</div><div class="text-lg font-bold text-forest">${recipe.servings}</div></div>` : ''}
                            ${recipe.difficulty ? `<div class="text-center"><div class="flex justify-center mb-2"><i data-lucide="zap" class="w-5 h-5 text-gold"></i></div><div class="text-xs uppercase font-bold text-sage">Difficulty</div><div class="text-lg font-bold text-forest">${recipe.difficulty}</div></div>` : ''}
                            ${recipe.cuisine ? `<div class="text-center"><div class="flex justify-center mb-2"><i data-lucide="globe" class="w-5 h-5 text-gold"></i></div><div class="text-xs uppercase font-bold text-sage">Cuisine</div><div class="text-lg font-bold text-forest">${recipe.cuisine}</div></div>` : ''}
                        </div>

                        <div class="detail-status-chips mb-8 flex flex-wrap items-center gap-2">
                            <span class="text-[10px] bg-white text-sage font-bold px-2.5 py-1.5 rounded-sm uppercase tracking-[0.24em] border border-parchmentDark">${recipe.category || 'Recipe'}</span>
                            ${recipe.diet && recipe.diet.length > 0 ? recipe.diet.map(d => `<span class="text-[10px] bg-gold bg-opacity-20 text-sage font-bold px-2.5 py-1.5 rounded-sm uppercase tracking-[0.16em]">${d}</span>`).join('') : ''}
                            ${isSavedCommunityRecipe ? `<span class="text-[10px] bg-forest bg-opacity-10 text-forest font-bold px-2.5 py-1.5 rounded-sm uppercase tracking-[0.16em] border border-forest border-opacity-10">Saved community recipe${recipeVersionLabel ? ` ${recipeVersionLabel}` : ''}</span>` : ''}
                            ${!isSavedCommunityRecipe && recipe.publishedId ? `<span class="text-[10px] ${recipeIsLive ? 'bg-forest bg-opacity-10 text-forest border-forest border-opacity-10' : 'bg-white text-sage border-parchmentDark'} font-bold px-2.5 py-1.5 rounded-sm uppercase tracking-[0.16em] border">${recipeIsLive ? 'Live in Browse' : 'Removed from Browse'}${recipeVersionLabel ? ` ${recipeVersionLabel}` : ''}</span>` : ''}
                            ${!isSavedCommunityRecipe && recipeHasUnpublishedChanges ? `<span class="text-[10px] bg-gold bg-opacity-15 text-forest font-bold px-2.5 py-1.5 rounded-sm uppercase tracking-[0.16em] border border-gold border-opacity-30">Local changes not published</span>` : ''}
                            ${savedRecipeIsOutdated ? `<span class="text-[10px] bg-gold bg-opacity-15 text-forest font-bold px-2.5 py-1.5 rounded-sm uppercase tracking-[0.16em] border border-gold border-opacity-30">Newer author version ${latestPublishedVersionLabel}</span>` : ''}
                            ${savedRecipeSourceRetracted ? `<span class="text-[10px] bg-white text-sage font-bold px-2.5 py-1.5 rounded-sm uppercase tracking-[0.16em] border border-parchmentDark">Original removed from Browse</span>` : ''}
                        </div>

                        ${savedRecipeIsOutdated && activeSavedRecipeUpdateNoticeId === recipe.id ? `
                            <div class="detail-secondary-section mb-8 rounded-md border border-gold border-opacity-40 bg-gold bg-opacity-10 p-4 shadow-sm">
                                <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div class="flex gap-3">
                                        <div class="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-gold shadow-sm">
                                            <i data-lucide="alert-circle" class="h-5 w-5"></i>
                                        </div>
                                        <div>
                                            <p class="text-xs font-bold uppercase tracking-[0.24em] text-sage">Author update available</p>
                                            <p class="mt-1 text-sm font-semibold text-forest">The author has published a newer version ${latestPublishedVersionLabel || ''}. Your saved copy stays on ${recipeVersionLabel || 'v1.00'} and will not change automatically.</p>
                                            <p class="mt-2 text-sm font-semibold text-sage">If you want the latest author changes, remove this saved copy from your Index and save the Browse version again.</p>
                                        </div>
                                    </div>
                                    <button onclick="renderPublishedRecipeDetail('${recipe.publishedId}')" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-parchmentDark bg-white px-4 text-xs font-bold uppercase tracking-[0.18em] text-forest shadow-sm transition-all hover:border-gold hover:text-sage">
                                        <i data-lucide="external-link" class="h-4 w-4 text-gold"></i>Open latest
                                    </button>
                                </div>
                            </div>
                        ` : ''}

                        <div class="detail-layout-grid grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                            <div class="detail-ingredients-panel md:col-span-1 bg-accent bg-opacity-30 p-6 rounded-md border border-sage border-opacity-10 h-fit">
                                <div class="flex justify-between items-center mb-6 pb-3 border-b border-sage border-opacity-20 gap-4">
                                    <h3 class="font-bold font-fantasy text-2xl flex items-center text-forest"><i data-lucide="shopping-basket" class="w-6 h-6 mr-2 text-gold"></i> Ingredients</h3>
                                    <div class="flex items-center bg-white rounded-sm shadow-sm border border-parchmentDark h-10" translate="no">
                                        <button onclick="updateScale(-0.5, ${recipe.id})" class="w-8 h-full flex items-center justify-center text-sage hover:text-forest font-bold">-</button>
                                        <span id="scale-display" class="font-bold text-forest text-sm min-w-[3rem] text-center border-x border-parchmentDark h-full flex items-center justify-center">${currentScale}x</span>
                                        <button onclick="updateScale(0.5, ${recipe.id})" class="w-8 h-full flex items-center justify-center text-sage hover:text-forest font-bold">+</button>
                                    </div>
                                </div>
                                <ul id="ingredients-list" class="text-sm space-y-2">
                                    ${generateIngredientsHTML(recipe)}
                                </ul>
                            </div>

                            <div id="instructions-section-${recipe.id}" class="detail-instructions-panel md:col-span-2">
                                <h3 class="font-bold font-fantasy text-3xl mb-6 flex items-center text-forest border-b border-accent pb-3"><i data-lucide="list-ordered" class="w-7 h-7 mr-3 text-gold"></i> Instructions</h3>
                                <ol class="space-y-4">
                                    ${(recipe.instructions || []).map((step, index) => {
                                        const isChecked = recipe.checkedSteps?.includes(index);
                                        const checkedClass = isChecked ? 'line-through opacity-40' : '';
                                        const iconClass = isChecked ? '' : 'opacity-0';
                                        const finalStep = applyMeasurementSystem(getRecipeInstructionText(step));
                                        const stepImage = getRecipeInstructionImage(step);

                                        return `
                                            <li class="recipe-step-${recipe.id} flex gap-4 items-start p-4 rounded-md transition-all duration-300 hover:bg-accent hover:bg-opacity-30 border border-transparent hover:border-sage hover:border-opacity-20 ${checkedClass} group" data-step-index="${index}">
                                                <div class="flex-shrink-0 relative">
                                                    <span onclick="toggleItemCheck(${recipe.id}, 'step', ${index}, this.closest('li'))" class="flex items-center justify-center w-8 h-8 rounded-sm bg-sage text-white font-bold text-sm shadow-sm cursor-pointer hover:bg-forest transition-colors">${index + 1}</span>
                                                    <div class="absolute -top-1 -right-1 bg-gold rounded-full p-0.5 text-white shadow-sm check-icon transition-opacity ${iconClass}"><i data-lucide="check" class="w-3 h-3"></i></div>
                                                </div>
                                                <div class="flex-1">
                                                    <p onclick="toggleItemCheck(${recipe.id}, 'step', ${index}, this.closest('li'))" class="text-forest font-medium text-base leading-relaxed pt-1 cursor-pointer">${finalStep}</p>
                                                    ${stepImage ? `<div class="mt-4 overflow-hidden rounded-md border border-parchmentDark bg-parchment"><img src="${stepImage}" alt="Instruction step ${index + 1}" class="h-48 w-full object-cover"></div>` : ''}
                                                </div>
                                                <button type="button" onclick="const mins = prompt('Timer (minutes):', '5'); if (mins) startStepTimer(parseInt(mins, 10))" class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gold hover:text-sage p-2" title="Start timer">
                                                    <i data-lucide="timer" class="w-5 h-5"></i>
                                                </button>
                                            </li>
                                        `;
                                    }).join('')}
                                </ol>
                            </div>
                        </div>

                        ${recipe.tips ? `
                            <div class="detail-secondary-section mt-12 w-full bg-sage bg-opacity-10 p-6 md:p-8 rounded-md border-l-4 border-gold shadow-inner">
                                <h3 class="font-bold font-fantasy text-2xl mb-4 flex items-center text-forest"><i data-lucide="lightbulb" class="w-6 h-6 mr-2 text-gold"></i> Chef's Notes & Secrets</h3>
                                <p class="text-base font-semibold text-forest leading-relaxed">${applyMeasurementSystem(recipe.tips)}</p>
                            </div>
                        ` : ''}

                        <div class="detail-library-tools mt-12 border-t border-accent pt-8">
                            <div class="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p class="text-xs font-bold uppercase tracking-[0.22em] text-sage">Library tools</p>
                                    <p class="mt-2 text-sm font-semibold text-sage">Use these for sharing, exporting, and publication management.</p>
                                </div>

                                <div class="flex flex-wrap items-start justify-start gap-4 md:justify-end">
                                    ${savedRecipeIsOutdated ? renderDetailIconAction('Update warning', 'alert-circle', `toggleSavedRecipeUpdateNotice(${recipe.id})`, 'border-gold bg-white text-gold hover:border-forest hover:text-forest') : ''}
                                    ${renderDetailIconAction('Share', 'share-2', `shareRecipe(${recipe.id})`, 'border-parchmentDark bg-white text-forest hover:border-gold hover:text-sage')}
                                    ${renderDetailIconAction('Export', 'download', `exportRecipeAsPDF(${recipe.id})`, 'border-gold bg-gold text-white hover:bg-yellow-600 hover:border-yellow-600')}
                                    ${isSavedCommunityRecipe ? '' : renderDetailIconAction(publishActionLabel, recipeIsLive ? 'cloud-upload' : 'cloud', `publishRecipe(${recipe.id})`, 'border-parchmentDark bg-white text-forest hover:border-gold hover:text-sage')}
                                    ${!isSavedCommunityRecipe && recipeIsLive ? renderDetailIconAction('Unpublish', 'cloud-off', `unpublishRecipe(${recipe.id})`, 'border-red-200 bg-white text-red-500 hover:border-red-500 hover:text-red-600') : ''}
                                </div>
                            </div>
                        </div>

                        <div class="detail-rating-panel mt-12 p-6 bg-accent bg-opacity-20 rounded-md border border-sage border-opacity-10 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div class="flex items-center gap-4">
                                <button id="fav-btn-${recipe.id}" onclick="toggleFavorite(${recipe.id})" ${isRecipeAlwaysFavorite(recipe) ? 'disabled' : ''} class="flex items-center gap-2 transition-colors p-3 rounded-md ${recipeIsFavorited ? 'text-red-500 bg-white' : 'text-sage hover:text-red-500 hover:bg-white'} ${isRecipeAlwaysFavorite(recipe) ? 'cursor-default opacity-90' : ''}">
                                    <i data-lucide="heart" class="w-6 h-6"></i>
                                    <span class="font-bold">${isRecipeAlwaysFavorite(recipe) ? 'Always favorite' : 'Favorite'}</span>
                                </button>
                            </div>
                            <div class="flex flex-col items-center gap-2 md:items-end">
                                <span class="text-xs uppercase font-bold text-sage">${recipeCanBeRated ? 'Your Rating:' : 'Your own recipe'}</span>
                                ${recipeCanBeRated ? `
                                    <div class="flex items-center gap-1">
                                        ${[1, 2, 3, 4, 5].map(star => `<button type="button" onclick="setRating(${recipe.id}, ${star})" class="rating-star-${recipe.id} transition-all hover:scale-110 ${(userSettings.myRecipeRatings?.[recipe.id] || 0) >= star ? 'opacity-100' : 'opacity-30'}"><i data-lucide="star" class="w-5 h-5 text-gold fill-current"></i></button>`).join('')}
                                    </div>
                                ` : `<p class="text-sm font-semibold text-sage">Ratings are only for recipes from other cooks.</p>`}
                            </div>
                        </div>

                        <div class="detail-notes-panel mt-8 p-6 bg-sage bg-opacity-5 rounded-md border border-sage border-opacity-10">
                            <div class="flex items-center justify-between mb-3">
                                <h3 class="font-bold font-fantasy text-lg flex items-center text-forest"><i data-lucide="sticky-note" class="w-5 h-5 mr-2 text-gold"></i> Your Notes</h3>
                                <button onclick="openNotesEditor(${recipe.id})" class="text-sage hover:text-gold transition-colors p-2">
                                    <i data-lucide="edit" class="w-5 h-5"></i>
                                </button>
                            </div>
                            <div id="notes-section-${recipe.id}">
                                ${recipe.personalNotes ? `<p class="text-sm text-forest">${recipe.personalNotes}</p>` : '<p class="text-xs text-sage italic">Click edit to add your personal notes and modifications...</p>'}
                            </div>
                        </div>
                    </div>

                    <div id="timer-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden opacity-0 scale-95 transition-all duration-300 flex items-center justify-center z-50" translate="no">
                        <div class="bg-white rounded-md shadow-2xl p-8 text-center max-w-sm mx-4">
                            <h2 class="font-fantasy font-bold text-3xl text-forest mb-4">Timer</h2>
                            <div class="bg-gold bg-opacity-10 p-8 rounded-md mb-6 border border-gold">
                                <div id="timer-display" class="text-6xl font-bold text-forest font-mono">00:00</div>
                            </div>
                            <div class="flex gap-4">
                                <button onclick="closeTimer()" class="flex-1 bg-forest text-white h-12 rounded-sm font-bold hover:bg-sage transition-colors">
                                    <i data-lucide="x" class="w-4 h-4 inline mr-2"></i>Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            lucide.createIcons();
        }

        function updateScale(amount, recipeId) {
            currentScale += amount;
            if (currentScale < 0.25) currentScale = 0.25; 
            if (currentScale > 10) currentScale = 10;    
            const recipe = recipes.find(r => r.id === recipeId);
            document.getElementById('ingredients-list').innerHTML = generateIngredientsHTML(recipe);
            document.getElementById('scale-display').textContent = `${currentScale}x`;
            lucide.createIcons();
        }

        function generateIngredientsHTML(recipe) {
            return recipe.ingredients.map((ing, index) => {
                const scaledIng = ing.replace(/(\d+[\.,]?\d*)/g, (match) => {
                    const num = parseFloat(match.replace(',', '.'));
                    let result = (num * currentScale);
                    return (result % 1 === 0 ? result : result.toFixed(1)).toString().replace('.', ',');
                });
                const finalIng = applyMeasurementSystem(scaledIng);
                const isChecked = recipe.checkedIngredients?.includes(index);
                const checkedClass = isChecked ? 'line-through opacity-40' : '';
                const iconClass = isChecked ? '' : 'opacity-0';

                return `
                    <li onclick="toggleItemCheck(${recipe.id}, 'ingredient', ${index}, this)" class="flex items-center cursor-pointer transition-all duration-300 p-3 bg-white rounded-md shadow-sm border border-transparent hover:border-sage ${checkedClass}">
                        <div class="w-6 h-6 rounded-sm border-2 border-gold flex items-center justify-center mr-3 flex-shrink-0 text-gold transition-colors bg-white">
                            <i data-lucide="check" class="check-icon w-4 h-4 transition-opacity ${iconClass}"></i>
                        </div>
                        <span class="text-forest font-semibold text-sm leading-snug">${finalIng}</span>
                    </li>
                `;
            }).join('');
        }

        async function triggerMagicGenerator() {
            const input = document.getElementById('ai-ingredients-input').value;
            if (!input.trim()) {
                showToast("Please enter some ingredients first!", "alert-circle");
                return;
            }

            const btn = document.getElementById('btn-magic-generate');
            const loader = document.getElementById('ai-loading');
            
            btn.disabled = true;
            btn.classList.add('opacity-50');
            loader.classList.remove('hidden');

            const payload = {
                contents: [{ parts: [{ text: `Generate a recipe using these ingredients: ${input}. Keep the language strictly in English. Return valid JSON.` }] }],
                systemInstruction: { parts: [{ text: "You are an expert Chef. Create a realistic, tasty recipe from the provided ingredients." }] },
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            title: { type: "STRING", description: "Creative recipe title" },
                            category: { type: "STRING", description: "Either: Cooking, Baking, Dessert, Drink" },
                            country: { type: "STRING", description: "Country of origin, e.g. Italy, France, USA" },
                            prepTime: { type: "INTEGER", description: "Preparation time in minutes" },
                            cookTime: { type: "INTEGER", description: "Cooking time in minutes" },
                            servings: { type: "INTEGER", description: "Number of servings, usually 4" },
                            difficulty: { type: "STRING", description: "Either: Easy, Medium, Hard" },
                            cuisine: { type: "STRING", description: "Cuisine type, e.g. Italian, Asian, Mediterranean" },
                            diet: { type: "ARRAY", items: { type: "STRING" }, description: "Applicable diet tags from: ${supportedDietOptionsText}" },
                            ingredients: { type: "ARRAY", items: { type: "STRING" } },
                            instructions: { type: "ARRAY", items: { type: "STRING" } },
                            tips: { type: "STRING" }
                        }
                    }
                }
            };

            try {
                const response = await fetchGeminiAPI(payload);
                const jsonText = response.candidates?.[0]?.content?.parts?.[0]?.text;
                const recipeData = JSON.parse(jsonText);

                document.getElementById('r-title').value = recipeData.title || "";
                
                // Ensure valid category
                const catElement = document.getElementById('r-category');
                const validCategories = Array.from(catElement.options).map(o => o.value);
                if(validCategories.includes(recipeData.category)) {
                    catElement.value = recipeData.category;
                }

                if(recipeData.country) {
                    document.getElementById('r-country').value = recipeData.country;
                }

                applyRecipeDetailFields(recipeData);

                document.getElementById('r-tips').value = recipeData.tips || "";

                draftIngredients = recipeData.ingredients || [];
                draftSteps = normalizeRecipeInstructions(recipeData.instructions);

                renderDraftIngredients();
                renderDraftSteps();
                
                showToast("âœ¨ Magic Recipe Generated!", "sparkles");
            } catch (err) {
                console.error(err);
                showToast("AI Chef failed to generate recipe. Try again.", "alert-triangle");
            } finally {
                btn.disabled = false;
                btn.classList.remove('opacity-50');
                loader.classList.add('hidden');
            }
        }

        function renderAddForm(recipeId = null) {
            isCookingMode = false;
            document.getElementById('body').classList.remove('cooking-mode-active');
            setActiveNav('add');
            const recipeToEdit = recipeId ? recipes.find(recipe => recipe.id === recipeId && recipe.source === 'local') : null;
            editingRecipeId = recipeToEdit ? recipeToEdit.id : null;
            recipeSubmitAction = 'save';
            draftIngredients = recipeToEdit ? [...(recipeToEdit.ingredients || [])] : [];
            draftSteps = recipeToEdit ? normalizeRecipeInstructions(recipeToEdit.instructions) : [];
            draftProfile = recipeToEdit?.profile && recipeToEdit.profile !== defaultPlaceholderProfile ? recipeToEdit.profile : null;
            const formTitle = recipeToEdit ? 'Edit Recipe' : 'Create Recipe';
            const submitLabel = recipeToEdit ? 'Update Recipe' : 'Save Recipe';
            const publishSubmitLabel = recipeToEdit
                ? (recipeToEdit.publishedId ? (isRecipePublishedLive(recipeToEdit) ? 'Save & Update Publish' : 'Save & Republish') : 'Save & Publish')
                : 'Save & Publish';
            const dietOptionsMarkup = dietOptions.map(option => {
                const desc = dietDescriptions[option] || '';
                return `<label class="relative flex items-center gap-2 cursor-pointer rounded-sm border border-parchmentDark bg-white px-3 py-2 font-semibold text-forest shadow-sm transition-all hover:border-gold hover:text-sage group">
                    <input type="checkbox" class="diet-checkbox" value="${option}"> <span class="flex-1">${option}</span>
                    <span class="ml-auto flex-shrink-0 text-sage/40 hover:text-gold transition-colors" title="${desc}">
                        <i data-lucide="info" class="w-3.5 h-3.5 pointer-events-none"></i>
                        <span class="pointer-events-none absolute bottom-full right-2 mb-2 w-52 rounded-md border border-parchmentDark bg-white p-2.5 text-xs font-normal text-forest shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-30 leading-relaxed text-left">${desc}</span>
                    </span>
                </label>`;
            }).join('');

            contentDiv.innerHTML = `
                <div class="bg-white p-6 md:p-10 rounded-sm shadow-sm mb-6 border border-parchmentDark max-w-4xl mx-auto">
                    
                    <!-- AI MAGIC GENERATOR FEATURE âœ¨ -->
                    <div class="bg-gradient-to-r from-accent to-gold/20 p-6 rounded-md border border-gold mb-10 shadow-sm relative overflow-hidden" translate="no">
                        <div class="absolute -right-4 -top-4 text-6xl opacity-10 pointer-events-none">âœ¨</div>
                        <h3 class="font-fantasy font-bold text-2xl text-forest mb-2 flex items-center gap-2">
                            <i data-lucide="sparkles" class="w-6 h-6 text-gold"></i> AI Magic Generator
                        </h3>
                        <p class="text-sm text-forest mb-4 font-semibold">Empty fridge? Tell us what ingredients you have, and our AI Chef will create a complete recipe for you!</p>
                        <div class="flex flex-col md:flex-row gap-2">
                            <input type="text" id="ai-ingredients-input" placeholder="e.g., chicken, broccoli, rice..." class="${inputClass} flex-1 !border-gold/50">
                            <button type="button" onclick="triggerMagicGenerator()" id="btn-magic-generate" class="bg-forest text-white h-12 px-6 rounded-sm font-bold shadow-md hover:bg-sage transition-colors flex items-center justify-center gap-2 whitespace-nowrap uppercase tracking-wider text-xs">
                                <span>Generate Recipe</span> <i data-lucide="sparkles" class="w-4 h-4 text-gold"></i>
                            </button>
                        </div>
                        <div id="ai-loading" class="hidden mt-4 text-sm font-bold text-sage flex items-center gap-2">
                            <i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> The AI Chef is thinking...
                        </div>
                    </div>

                    <h2 class="font-fantasy font-bold text-3xl mb-8 text-forest border-b border-accent pb-4 flex items-center gap-2"><i data-lucide="file-plus-2" class="w-8 h-8 text-gold"></i> ${formTitle}</h2>
                    
                    <form id="add-recipe-form" class="space-y-8" onsubmit="saveRecipe(event)">
                        <div class="flex flex-col items-center mb-8 bg-accent bg-opacity-30 p-6 rounded-md border border-sage border-opacity-10">
                            <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-4">Meal Presentation Photo</label>
                            <label class="custom-file-upload">
                                <input type="file" accept="image/*" onchange="handleImageUpload(event, 'profile-preview', 'draftProfile', false)">
                                <div id="profile-preview" class="w-40 h-40 border-2 border-dashed border-sage rounded-sm flex flex-col items-center justify-center bg-white hover:bg-accent transition-colors bg-cover bg-center text-sage shadow-inner">
                                    <i data-lucide="camera" class="w-8 h-8 mb-2"></i><span class="text-xs font-bold uppercase tracking-wider">Upload</span>
                                </div>
                            </label>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-accent bg-opacity-30 rounded-md border border-sage border-opacity-10">
                            <div class="md:col-span-2"><label class="block text-xs uppercase tracking-wide font-bold text-sage mb-2">Recipe Title</label><input type="text" id="r-title" required class="${inputClass}"></div>
                            <div><label class="block text-xs uppercase tracking-wide font-bold text-sage mb-2">Author</label><input type="text" id="r-author" value="${userSettings.name}" class="${inputClass}"></div>
                            <div>
                                <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-2">Category</label>
                                <select id="r-category" required class="${inputClass}">
                                    <option value="Cooking">Cooking</option><option value="Baking">Baking</option>
                                    <option value="Dessert">Dessert</option><option value="Drink">Drink</option>
                                </select>
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-2">Country / Origin</label>
                                <input type="text" id="r-country" list="countries-list" placeholder="Typ of selecteer een land..." value="${userSettings.country}" class="${inputClass}">
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-3 flex items-center gap-2 border-b border-accent pb-2"><i data-lucide="shopping-basket" class="w-4 h-4"></i> Ingredients</label>
                                <ul id="draft-ingredients-list" class="mb-3 space-y-2"></ul>
                                <div class="flex gap-2">
                                    <input type="text" id="new-ingredient" placeholder="e.g. 500g Flour" onkeypress="if(event.key === 'Enter') { event.preventDefault(); addDraftIngredient(); }" class="${inputClass} flex-1">
                                    <button type="button" onclick="addDraftIngredient()" class="bg-sage text-white w-12 h-12 rounded-sm font-bold flex items-center justify-center hover:bg-forest transition-colors shadow-sm"><i data-lucide="plus" class="w-5 h-5"></i></button>
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-3 flex items-center gap-2 border-b border-accent pb-2"><i data-lucide="list-ordered" class="w-4 h-4"></i> Instructions</label>
                                <ul id="draft-steps-list" class="mb-3 space-y-2"></ul>
                                <div class="flex gap-2 items-start">
                                    <textarea id="new-step" placeholder="Describe the next step..." class="${textareaClass} flex-1 !min-h-[48px] !h-12 py-3"></textarea>
                                    <button type="button" onclick="addDraftStep()" class="bg-sage text-white w-12 h-12 rounded-sm font-bold flex items-center justify-center hover:bg-forest transition-colors shadow-sm"><i data-lucide="plus" class="w-5 h-5"></i></button>
                                </div>
                            </div>
                        </div>

                        <div><label class="block text-xs uppercase tracking-wide font-bold text-sage mb-2 flex items-center gap-2"><i data-lucide="lightbulb" class="w-4 h-4"></i> Chef's Notes</label><textarea id="r-tips" placeholder="Secret ingredient..." class="${textareaClass}"></textarea></div>

                        <div class="rounded-md border border-sage border-opacity-10 bg-accent bg-opacity-20 overflow-hidden">
                            <button type="button" onclick="toggleRecipeDetails()" class="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-white hover:bg-opacity-50 transition-colors">
                                <div>
                                    <p id="recipe-details-toggle-label" class="text-sm font-bold uppercase tracking-[0.24em] text-sage">Details</p>
                                    <p id="recipe-details-toggle-hint" class="mt-1 text-sm font-semibold text-forest opacity-80">Optional metadata for timing, cuisine, servings and diet.</p>
                                </div>
                                <div class="flex items-center gap-3 text-sage">
                                    <span class="hidden md:inline text-xs font-bold uppercase tracking-[0.24em] opacity-70">Auto-fill ready</span>
                                    <i id="recipe-details-toggle-icon" data-lucide="chevron-down" class="w-5 h-5 transition-transform duration-200"></i>
                                </div>
                            </button>

                            <div id="recipe-details-panel" class="hidden border-t border-sage border-opacity-10 p-5 md:p-6 space-y-6 bg-white bg-opacity-70">
                                <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p class="text-xs font-bold uppercase tracking-[0.24em] text-sage">Recipe Details</p>
                                        <p class="mt-1 text-sm font-semibold text-forest opacity-80">Let AI estimate the details from your ingredients, instructions and chef's notes, then fine-tune anything yourself.</p>
                                    </div>
                                    <button type="button" id="btn-autofill-details" onclick="autoFillRecipeDetails()" class="bg-forest text-white h-11 px-5 rounded-sm font-bold shadow-md hover:bg-sage transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-xs whitespace-nowrap">
                                        <i id="autofill-details-icon" data-lucide="sparkles" class="w-4 h-4 text-gold"></i> Auto-fill
                                    </button>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div>
                                        <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-2">Prep Time (min)</label>
                                        <input type="number" id="r-prepTime" min="0" max="1440" placeholder="15" class="${inputClass}">
                                    </div>
                                    <div>
                                        <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-2">Cook Time (min)</label>
                                        <input type="number" id="r-cookTime" min="0" max="1440" placeholder="30" class="${inputClass}">
                                    </div>
                                    <div>
                                        <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-2">Servings</label>
                                        <input type="number" id="r-servings" min="1" max="20" value="4" class="${inputClass}">
                                    </div>
                                    <div>
                                        <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-2">Difficulty</label>
                                        <select id="r-difficulty" class="${inputClass}">
                                            <option value="">Select</option>
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-2">Cuisine Type</label>
                                        <input type="text" id="r-cuisine" placeholder="e.g. Italian, Asian..." class="${inputClass}">
                                    </div>
                                    <div>
                                        <label class="block text-xs uppercase tracking-wide font-bold text-sage mb-2">Diet Options</label>
                                        <div class="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                                            ${dietOptionsMarkup}
                                        </div>
                                    </div>
                                </div>

                                <p class="text-xs text-sage font-semibold italic">AI suggestions are only a starting point. Every field stays fully editable before you save.</p>
                            </div>
                        </div>

                        <div class="pt-8 flex flex-col gap-4 border-t border-accent mt-4 sm:flex-row sm:items-center sm:justify-between">
                            <button type="button" onclick="cancelRecipeEditor()" class="h-12 px-6 text-sage hover:text-forest font-bold transition-colors text-sm uppercase tracking-wider" translate="no">Cancel</button>
                            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                                <button type="submit" onclick="recipeSubmitAction = 'save'" class="bg-gold text-white h-12 px-8 rounded-sm font-bold shadow-md hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-sm min-w-[150px]" translate="no"><i data-lucide="save" class="w-4 h-4"></i> ${submitLabel}</button>
                                <button type="submit" onclick="recipeSubmitAction = 'publish'" class="bg-forest text-white h-12 px-8 rounded-sm font-bold shadow-md hover:bg-sage transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-sm min-w-[180px]" translate="no"><i data-lucide="cloud-upload" class="w-4 h-4"></i> ${publishSubmitLabel}</button>
                            </div>
                        </div>
                    </form>
                </div>
                <datalist id="countries-list">${countriesList.map(c => `<option value="${c}"></option>`).join('')}</datalist>
            `;
            lucide.createIcons();

            if (recipeToEdit) {
                document.getElementById('r-title').value = recipeToEdit.title || '';
                document.getElementById('r-author').value = recipeToEdit.author || '';
                document.getElementById('r-category').value = recipeToEdit.category || '';
                document.getElementById('r-country').value = recipeToEdit.country || '';
                document.getElementById('r-tips').value = recipeToEdit.tips || '';
                applyRecipeDetailFields(recipeToEdit);

                const profilePreview = document.getElementById('profile-preview');
                if (profilePreview) {
                    profilePreview.style.backgroundImage = `url(${recipeToEdit.profile || defaultPlaceholderProfile})`;
                    profilePreview.innerHTML = '';
                }
            }

            renderDraftIngredients();
            renderDraftSteps();
        }

        function addDraftIngredient() {
            const input = document.getElementById('new-ingredient');
            if(input.value.trim() === '') return;
            draftIngredients.push(input.value.trim());
            input.value = '';
            renderDraftIngredients();
        }

        function removeDraftIngredient(index) { draftIngredients.splice(index, 1); renderDraftIngredients(); }

        function renderDraftIngredients() {
            document.getElementById('draft-ingredients-list').innerHTML = draftIngredients.map((ing, i) => `
                <li class="flex justify-between items-center bg-white min-h-[48px] px-4 rounded-sm border border-parchmentDark shadow-sm text-sm font-semibold text-forest">
                    <span class="flex items-center gap-2"><div class="w-1.5 h-1.5 bg-gold rounded-full"></div> ${ing}</span>
                    <button type="button" onclick="removeDraftIngredient(${i})" class="text-red-400 hover:text-red-600 p-2"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </li>
            `).join('');
            lucide.createIcons();
        }

        function setRecipeDetailsVisibility(isVisible) {
            const panel = document.getElementById('recipe-details-panel');
            const label = document.getElementById('recipe-details-toggle-label');
            const hint = document.getElementById('recipe-details-toggle-hint');
            const icon = document.getElementById('recipe-details-toggle-icon');

            if (!panel || !label || !hint || !icon) return;

            panel.classList.toggle('hidden', !isVisible);
            label.textContent = isVisible ? 'Hide Details' : 'Details';
            hint.textContent = isVisible ? 'Optional metadata, all editable below.' : 'Optional metadata for timing, cuisine, servings and diet.';
            icon.classList.toggle('rotate-180', isVisible);
        }

        function toggleRecipeDetails() {
            const panel = document.getElementById('recipe-details-panel');
            if (!panel) return;
            setRecipeDetailsVisibility(panel.classList.contains('hidden'));
        }

        function applyRecipeDetailFields(recipeData) {
            if (recipeData.prepTime !== undefined && recipeData.prepTime !== null) {
                document.getElementById('r-prepTime').value = recipeData.prepTime;
            }
            if (recipeData.cookTime !== undefined && recipeData.cookTime !== null) {
                document.getElementById('r-cookTime').value = recipeData.cookTime;
            }
            if (recipeData.servings !== undefined && recipeData.servings !== null) {
                document.getElementById('r-servings').value = recipeData.servings;
            }
            if (recipeData.difficulty) {
                const difficultyElement = document.getElementById('r-difficulty');
                const validDifficulties = Array.from(difficultyElement.options).map(option => option.value);
                if (validDifficulties.includes(recipeData.difficulty)) difficultyElement.value = recipeData.difficulty;
            }
            if (recipeData.cuisine) {
                document.getElementById('r-cuisine').value = recipeData.cuisine;
            }
            if (Array.isArray(recipeData.diet)) {
                document.querySelectorAll('.diet-checkbox').forEach(checkbox => {
                    checkbox.checked = recipeData.diet.includes(checkbox.value);
                });
            }
            setRecipeDetailsVisibility(true);
        }

        function localAutoTagRecipe(title, ingredientsStr, notesStr) {
            const str = (title + ' ' + ingredientsStr + ' ' + notesStr).toLowerCase();
            const tags = { difficulty: 'Easy', categories: [], diet: [] };
            if (/beef|chicken|pork|sausage|meat|steak/i.test(str)) { tags.difficulty = 'Medium'; tags.categories.push('Main Course'); }
            if (!/meat|beef|chicken|pork/i.test(str)) { tags.diet.push('Vegetarian'); }
            return tags;
        }

        async function autoFillRecipeDetails() {
            const btn = document.getElementById('btn-autofill-details');
            const icon = document.getElementById('autofill-details-icon');
            if (btn) { btn.disabled = true; btn.classList.add('opacity-60'); }
            if (icon) icon.classList.add('animate-spin');
            
            try {
                const title = document.getElementById('r-title').value || '';
                const ingredients = draftIngredients.join(' ');
                const notes = document.getElementById('r-tips')?.value || '';
                
                const tags = localAutoTagRecipe(title, ingredients, notes);
                
                document.getElementById('r-prep').value = 15;
                document.getElementById('r-cook').value = 30;
                document.getElementById('r-servings').value = 4;
                if (tags.categories.length > 0) document.getElementById('r-category').value = tags.categories.join(', ');
                if (tags.diet.length > 0) document.getElementById('r-diet').value = tags.diet.join(', ');
                document.getElementById('r-difficulty').value = tags.difficulty;
                document.getElementById('r-cost').value = ']';
                
                showToast('Smart Tags Applied locally!', 'check-circle');
            } catch (err) {
                console.error(err);
            } finally {
                if (btn) { btn.disabled = false; btn.classList.remove('opacity-60'); }
                if (icon) icon.classList.remove('animate-spin');
            }
        }

        function addDraftStep() {
            const input = document.getElementById('new-step');
            if(input.value.trim() === '') return;
            draftSteps.push({ text: input.value.trim(), image: '' });
            input.value = '';
            renderDraftSteps();
        }

        function removeDraftStep(index) { draftSteps.splice(index, 1); renderDraftSteps(); }

        function handleDraftStepImageUpload(event, index) {
            const file = event.target.files[0];
            if (!file || !draftSteps[index]) return;

            const reader = new FileReader();
            reader.onload = function(loadEvent) {
                const normalizedStep = normalizeRecipeInstructionStep(draftSteps[index]) || { text: '', image: '' };
                draftSteps[index] = {
                    ...normalizedStep,
                    image: loadEvent.target.result
                };
                renderDraftSteps();
            };
            reader.readAsDataURL(file);
        }

        function clearDraftStepImage(index) {
            if (!draftSteps[index]) return;

            const normalizedStep = normalizeRecipeInstructionStep(draftSteps[index]) || { text: '', image: '' };
            draftSteps[index] = {
                ...normalizedStep,
                image: ''
            };
            renderDraftSteps();
        }

        function renderDraftSteps() {
            document.getElementById('draft-steps-list').innerHTML = draftSteps.map((step, i) => {
                const stepText = getRecipeInstructionText(step);
                const stepImage = getRecipeInstructionImage(step);

                return `
                    <li class="bg-white p-3 rounded-sm border border-parchmentDark shadow-sm text-sm font-medium text-forest">
                        <div class="flex items-start gap-3">
                            <span class="bg-sage text-white w-6 h-6 flex items-center justify-center rounded-sm text-xs font-bold flex-shrink-0 mt-0.5">${i + 1}</span>
                            <div class="flex-1 pt-0.5">
                                <p class="leading-relaxed">${stepText}</p>
                                ${stepImage ? `<div class="mt-3 overflow-hidden rounded-md border border-parchmentDark bg-parchment"><img src="${stepImage}" alt="Draft step ${i + 1}" class="h-40 w-full object-cover"></div>` : ''}
                                <div class="mt-3 flex flex-wrap gap-2">
                                    <label class="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-parchmentDark bg-white px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-sage shadow-sm transition-all hover:border-gold hover:text-forest cursor-pointer">
                                        <input type="file" accept="image/*" class="hidden" onchange="handleDraftStepImageUpload(event, ${i})">
                                        <i data-lucide="image-plus" class="h-4 w-4 text-gold"></i>${stepImage ? 'Change photo' : 'Add photo'}
                                    </label>
                                    ${stepImage ? `<button type="button" onclick="clearDraftStepImage(${i})" class="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-parchmentDark bg-white px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-sage shadow-sm transition-all hover:border-red-400 hover:text-red-500"><i data-lucide="image-off" class="h-4 w-4"></i>Remove photo</button>` : ''}
                                </div>
                            </div>
                            <button type="button" onclick="removeDraftStep(${i})" class="text-red-400 hover:text-red-600 p-1 flex-shrink-0"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                        </div>
                    </li>
                `;
            }).join('');
            lucide.createIcons();
        }

        async function saveRecipe(event) {
            event.preventDefault();
            if (draftIngredients.length === 0) { showToast('Add at least one ingredient!', 'alert-circle'); return; }
            if (draftSteps.length === 0) { showToast('Add at least one step!', 'alert-circle'); return; }

            const shouldPublishAfterSave = recipeSubmitAction === 'publish';
            recipeSubmitAction = 'save';

            const dietCheckboxes = document.querySelectorAll('.diet-checkbox:checked');
            const selectedDiet = Array.from(dietCheckboxes).map(cb => cb.value);

            const existingRecipe = editingRecipeId ? recipes.find(recipe => recipe.id === editingRecipeId) : null;
            const recipePayload = {
                ...existingRecipe,
                id: existingRecipe?.id || generateId(),
                title: document.getElementById('r-title').value,
                author: document.getElementById('r-author').value || 'Unknown',
                source: existingRecipe?.source || 'local',
                category: document.getElementById('r-category').value,
                country: document.getElementById('r-country').value,
                profile: draftProfile || existingRecipe?.profile || defaultPlaceholderProfile,
                prepTime: parseInt(document.getElementById('r-prepTime').value) || 0,
                cookTime: parseInt(document.getElementById('r-cookTime').value) || 0,
                servings: parseInt(document.getElementById('r-servings').value) || 4,
                difficulty: document.getElementById('r-difficulty').value || '',
                diet: selectedDiet,
                cuisine: document.getElementById('r-cuisine').value || '',
                ingredients: [...draftIngredients],
                instructions: normalizeRecipeInstructions(draftSteps),
                tips: document.getElementById('r-tips').value,
                lastOpened: existingRecipe?.lastOpened || Date.now(),
                checkedIngredients: existingRecipe?.checkedIngredients || [],
                checkedSteps: existingRecipe?.checkedSteps || [],
                personalNotes: existingRecipe?.personalNotes || "",
                notebookStickyNotes: normalizeNotebookStickyNotes(existingRecipe?.notebookStickyNotes)
            };

            if (existingRecipe) {
                recipes = recipes.map(recipe => recipe.id === existingRecipe.id ? recipePayload : recipe);
            } else {
                recipes.push(recipePayload);
            }

            saveData();
            const savedRecipeId = recipePayload.id;
            editingRecipeId = null;

            if (shouldPublishAfterSave) {
                await publishRecipe(savedRecipeId);
                renderDetail(savedRecipeId);
                contentDiv.scrollTop = 0;
                return;
            }

            if (existingRecipe) {
                showToast('Recipe updated successfully!', 'check-circle');
                renderDetail(savedRecipeId);
            } else {
                showToast('Recipe successfully added!', 'check-circle');
                searchQuery = "";
                categoryFilter = "";
                renderList();
            }

            contentDiv.scrollTop = 0;
        }

        function shareRecipe(id) {
            const recipe = recipes.find(r => r.id === id);
            if (!recipe) return;
            const shareText = `Check out this recipe: ${recipe.title}!\n\nIngredients:\n- ${recipe.ingredients.join('\n- ')}\n\nLet's cook!`;
            if (navigator.share) navigator.share({ title: recipe.title, text: shareText }).catch(() => copyToClipboard(shareText));
            else copyToClipboard(shareText);
        }

        function copyToClipboard(text) {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try { document.execCommand('copy'); showToast('Copied to clipboard!', 'copy'); } 
            catch (err) { showToast('Copy failed.', 'x-circle'); }
            document.body.removeChild(textArea);
        }

        loadData();
        
                // Initialize Firebase if available (Phase 2)
                if (typeof firebase !== 'undefined') {
                    try {
                        initializeFirebase();
                    } catch (error) {
                        console.log("Firebase SDK not loaded - local mode only");
                    }
                }
        renderList();
    
