const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN';
const _DEFAULT_DATA_STORE_PORT = 9999;
const API_BASE_URL = 'https://api.nameshouts.com/api/v2.0'

var isInjected = false

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        const nameTagElement = mutation.target.querySelector("h1[itemprop='name']");
        if (!isInjected && nameTagElement) {
            isInjected = true
            var nameTag = $("h1[itemprop='name']");
            nameTag.css('display', 'inline-flex');
            var nameToQuery = nameTag.text().trim();
            var cssStyle = 'display:inline-flex;margin-left: 5px;margin-bottom: 4px;vertical-align: middle;';
            var audioImgStyle = 'margin-left: 5px;margin-bottom: 10px;vertical-align: middle;height:24px;width:24px;';
            var infoImgStyle = 'margin-left: -8px;margin-bottom: -7px;vertical-align: middle; width: 12px !important;height: 12px !important;';
            const cardPosition = 'position: absolute; display: inline-block; margin-top: 145px !important;margin-left: 130px !important;';
            var multiName = false;
            var mulInstance = false;

            var index = 1;
            injectAudio(
                nameTag,
                nameToQuery,
                cssStyle,
                audioImgStyle,
                infoImgStyle,
                cardPosition,
                index,
                multiName,
                _DEFAULT_DATA_STORE_PORT,
                mulInstance
            );
        }
    });
});

observer.observe(document, {
    childList: true,
    subtree: true,
});

var remainingShouts = null
getRemainingShouts()

async function getRemainingShouts() {
    const myHeaders = new Headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
    });

    const base_url = `${API_BASE_URL}/activity-count`;

    var rawResponse = await fetch(base_url, {
        method: 'GET',
        headers: myHeaders,
    })
    var response = await rawResponse.json()
    remainingShouts = response.limit - response.count
}

function injectAudio(nameTag, nameToQuery, cssStyle, audioImgStyle, infoImgStyle, cardPosition, index, multiName, source, mulInstance) {
    let preLoadBtnId = `preload-btn-${index}`;
    let audioImgBtnId = `audio-img-btn-${index}`;
    let playerId = `player-${index}`;
    let cardPlayerId = `main-player-${index}`;
    let cardAudioBtnId = `main-audio-btn-${index}`;

    //Info and Card Variables
    let cardId = `card-${index}`;
    let cardCancelId = `card-cancel-icon-${index}`;
    let addIconId = `add-icon-${index}`;
    let infoImgId = `info-img-${index}`;

    if (mulInstance) {
        preLoadBtnId = `preload-btn-sing-${index}`;
        audioImgBtnId = `audio-img-btn-sing-${index}`;
        playerId = `player-sing-${index}`;
        cardPlayerId = `main-player-sing-${index}`;
        cardAudioBtnId = `main-audio-btn-sing-${index}`;
        //Info and Card Variables
        cardId = `card-sing-${index}`;
        cardCancelId = `card-cancel-icon-sing-${index}`;
        addIconId = `add-icon-sing-${index}`;
        infoImgId = `info-img-sing-${index}`;
    }

    const NSPreloadButtonURL = "../assets/images/ns-preload-btn.svg";

    let html = `<div id="${preLoadBtnId}" class="ns-preload-btn" aria-label="Loading..." data-balloon-pos="up" style="${cssStyle}">`;
    html += '<div class="NS PlayButton NSSoundPlay">';
    html += '<object data="' + NSPreloadButtonURL + '" type="image/svg+xml"></object>';
    html += '</div>';
    html += '</div>';


    $(html).insertAfter(nameTag);

    $(document).click(function (e) {
        const cardContainer = $(`#${cardId}`);
        const infoImageContainer = $(`#${infoImgId}`);

        if (!infoImageContainer.is(e.target)) {
            if (cardContainer.has(e.target).length === 0) {
                cardContainer.hide();
            }
        }
    });


    $(`#${preLoadBtnId}`).hover(async function () {
        closeCards(cardId);

        await new Promise(resolve => {
            var checkShouts = () => {
                if (remainingShouts === null)
                    setTimeout(checkShouts, 200)
                else
                    resolve()
            }
            checkShouts()
        })

        const shoutsLeft = remainingShouts

        if (shoutsLeft == 0) {
            noSearchUpgrade(
                preLoadBtnId,
                audioImgBtnId,
                audioImgStyle,
                playerId,
                infoImgId,
                infoImgStyle,
                cardId,
                cardPosition,
                cardCancelId,
                cardAudioBtnId,
                cardPlayerId);

            addClickListener(
                infoImgId,
                cardId,
                cardCancelId);

            return;

        }

        const facade = new Facade();
        const nameList = await facade.fetchNameList(source, nameToQuery);
        let namesLoaded = new Map();
        remainingShouts--
        let allNamesData = {};
        allNamesData.langSelected = 0;
        allNamesData.nameList = nameList;
        let uuid = generateUUID();
        namesLoaded.set(uuid, allNamesData);

        if (nameList.length > 0) {
            populateAudioBtn(
                preLoadBtnId,
                audioImgBtnId,
                audioImgStyle,
                playerId,
                infoImgId,
                infoImgStyle,
                cardId,
                cardPosition,
                cardCancelId,
                cardAudioBtnId,
                cardPlayerId,
                uuid,
                nameList);
        } else {
            noNameBtn(
                preLoadBtnId,
                audioImgBtnId,
                uuid,
                audioImgStyle,
                playerId,
                infoImgId,
                infoImgStyle,
                cardId,
                cardPosition,
                cardCancelId,
                cardAudioBtnId,
                cardPlayerId,
                nameToQuery,
                addIconId);

        }

        $(document).on("click", `#${audioImgBtnId}`, async function (e) {
            let namesInfo = namesLoaded.get(e.target.dataset.uuid);
            let nameToPlay = namesInfo.nameList[namesInfo.langSelected];

            var playList = nameToPlay.path;
            var mediaUrl = 'https://nslibrary01.blob.core.windows.net/ns-audio/';

            var i = 0;

            var audio = playList[i];
            var url = mediaUrl + audio + '.mp3';

            $(`#${playerId}`)
                .attr("src", url);

            $(`#${playerId}`)
                .attr("type", 'audio/mpeg');

            $(`#${playerId}`)[0].load();

            $(`#${playerId}`)[0].play();

            $(`#${playerId}`).on('ended', function (e) {
                var endedTag = e.target;
                i++;

                if (i < playList.length) {
                    var audio = playList[i];
                    var url = mediaUrl + audio + '.mp3';

                    $(`#${playerId}`).attr("src", url);
                    $(`#${playerId}`).attr("type", 'audio/mpeg');
                    $(`#${playerId}`)[0].load();
                    $(`#${playerId}`)[0].play();
                }

            });
        });

        // $(`#${cardId}`).on('load', (function (e) {
        //     $(document).on("click", `#${infoImgId}`, function (e) {
        //         if (($(`#${cardId}`).css('display') == 'none')) {
        //             $(`#${cardId}`).show();
        //         }
        //         else {
        //             $(`#${cardId}`).hide();
        //         }
        //     });
        // }));

        $(`#${infoImgId}`).on('load', function (e) {
            $(document).on("click", `#${infoImgId}`, toggleCard);
        });

        //display card - for when user not logged in
        function addClickListener(infoImgId, cardId, cardCancelId) {
            $(`#${infoImgId}`).on('click', function () {
                //card display
                const card = $(`#${cardId}`);
                card.toggle();
                //cancel button
                $(document).on("click", `#${cardCancelId}`, function (e) {
                    $(`#${cardId}`).hide();
                });
            });
        }

        function toggleCard(e) {
            const card = $(`#${cardId}`);
            card.toggle();
        }

        $(document).on("click", `#${cardCancelId}`, function (e) {
            $(`#${cardId}`).hide();

        });

        $(document).on("click", `#${cardAudioBtnId}`, async function (e) {
            let namesInfo = namesLoaded.get(e.target.dataset.uuid);

            //LangSelected contains index of picked language
            //Default is 0
            let nameToPlay = namesInfo.nameList[namesInfo.langSelected];


            var playList = nameToPlay.path;
            var mediaUrl = 'https://nslibrary01.blob.core.windows.net/ns-audio/';

            var i = 0;

            var audio = playList[i];
            var url = mediaUrl + audio + '.mp3';

            $(`#${cardPlayerId}`).attr("src", url);
            $(`#${cardPlayerId}`).attr("type", 'audio/mpeg');

            $(`#${cardPlayerId}`)[0].load();

            $(`#${cardPlayerId}`)[0].play();

            $(`#${cardPlayerId}`).on('ended', function (e) {
                var endedTag = e.target;
                i++;

                if (i < playList.length) {
                    var audio = playList[i];
                    var url = mediaUrl + audio + '.mp3';

                    $(`#${cardPlayerId}`).attr("src", url);
                    $(`#${cardPlayerId}`).attr("type", 'audio/mpeg');
                    $(`#${cardPlayerId}`)[0].load();
                    $(`#${cardPlayerId}`)[0].play();
                }

            });

        });

        $(document).on("change", ".lang-dropdown", async function (e) {
            let selValue = parseInt(this.value);

            let uuid = $(event.target).parent().next().find('img').data('uuid');
            let nameData = namesLoaded.get(uuid);

            nameData.langSelected = selValue;
            namesLoaded.set(uuid, nameData);


            //Update selected value for nameData

            let nameInfo = nameData.nameList[nameData.langSelected];
            let phonetic = nameInfo.phonetic.join(' ');

            //Locate nearest phonetic class to selected card and then update
            $(event.target).parent().siblings('.phonetic').text(phonetic);
        });
        // });
    });

}


function populateAudioBtn(preLoadBtnId, audioImgBtnId, audioImgStyle, playerId, infoImgId, infoImgStyle, cardId, cardPosition, cardCancelId, cardAudioBtnId, cardPlayerId, uuid, nameList) {
    var mainDiv = $('<div class="ns-audio-btn" style="display: inline-flex; vertical-align: middle;"></div>');

    //Audio Btn and Div
    var btnDiv = $('<div class="wrap-div" aria-label="Hear pronunciation" data-balloon-pos="up" style="display: inline-flex;"></div>');
    var img = $(`<img id="${audioImgBtnId}" class="dynamic" data-uuid="${uuid}" style="${audioImgStyle}"/>`);
    img.attr('src', "../assets/images/ns-btn-loaded.svg");

    var audioDiv = $(`<audio class="audio-btn" id="${playerId}" style="margin-left: 5px;margin-bottom: 10px;vertical-align: middle;"></audio>`); //Equivalent: $(document.createElement('img'))
    var imgAud = img.add(audioDiv);
    var imgDiv = $(btnDiv).append(imgAud);


    //Info Btn and Div
    var infoDiv = $('<div aria-label="Click for more info" data-balloon-pos="up" style="display: inline-flex;"></div>'); //Equivalent: $(document.createElement('img'))
    var infoIcon = $(`<img id="${infoImgId}" class="info-class get-bigger" style="${infoImgStyle}"/>`);
    infoIcon.attr('src', "../assets/images/ns-info-icon-for-btn.svg");

    var infoDiv = $(infoDiv).append(infoIcon);

    //Combine audio and info btn and put it on a master div
    var audioSeg = imgDiv.add(infoDiv);
    var audioCombo = $(mainDiv).append(audioSeg);




    //Create nameCard

    let showLangDropdown = false;
    let nameInfo = {};
    nameInfo = nameList[0];

    if (nameList.length > 1) {
        showLangDropdown = true;
    }


    let fullName = nameInfo.name.join(' ');
    let phonetic = nameInfo.phonetic.join(' ');
    let langName = nameInfo.lang_name;


    const NSMainButtonURL = "../assets/images/ns-main-audio.svg";
    const NSCancelIconURL = "../assets/images/card-cancel-icon.svg";



    let cardSeg = `<div id="${cardId}" class="ns-card" style="${cardPosition}">`;
    cardSeg += '<div class="ns-card-content">';
    cardSeg += '<div class="ns-card-cancel-box" aria-label="Close info card!" data-balloon-pos="up">';
    cardSeg += `<img src=${NSCancelIconURL} id="${cardCancelId}" class="ns-card-cancel-icon" style="width:12px;height:12px;"/>`;
    cardSeg += '</div>';
    if (!showLangDropdown) {
        cardSeg += '<div class="language">';
        cardSeg += langName;
        cardSeg += '</div>';
    }
    else {
        //show lang dropdown
        //get available languages and values from list
        cardSeg += '<div class="language">';
        cardSeg += '<select class="lang-dropdown">';
        for (let i = 0; i < nameList.length; i++) {
            //Set to first value
            if (i === 0) {
                cardSeg += `<option value=${i} SELECTED>${nameList[i].lang_name}</option>`;
            }
            else {
                cardSeg += `<option value=${i}>${nameList[i].lang_name}</option>`;
            }

        }
        cardSeg += '</select>';
        cardSeg += '</div>';

    }

    cardSeg += '<div class="main-audio" aria-label="Hear pronunciation" data-balloon-pos="up">';
    cardSeg += `<img src=${NSMainButtonURL} id="${cardAudioBtnId}" data-uuid="${uuid}" class="main-audio-btn" style="width:36px;height:36px;"/>`;
    cardSeg += `<audio id="${cardPlayerId}"></audio>`;
    cardSeg += '</div>';
    cardSeg += '<div class="full-name">';
    cardSeg += fullName;
    cardSeg += '</div>';
    cardSeg += '<div class="phonetic">';
    cardSeg += phonetic;
    cardSeg += '</div>';
    cardSeg += '</div>';
    cardSeg += '</div>';
    var totalCombo = $(audioCombo).add(cardSeg);


    $(`#${preLoadBtnId}`).replaceWith(totalCombo);
}

function noNameBtn(preLoadBtnId, audioImgBtnId, uuid, audioImgStyle, playerId, infoImgId, infoImgStyle, cardId, cardPosition, cardCancelId, cardAudioBtnId, cardPlayerId, nameToQuery, addIconId) {

    const NSNoNameButtonURL = "../assets/images/no-name-icon.svg";
    var mainDiv = $('<div class="ns-audio-btn" style="display: inline-flex; vertical-align: middle;"></div>');

    //Audio Btn and Div
    var btnDiv = $('<div class="wrap-div" aria-label="Hear pronunciation" data-balloon-pos="up" style="display: inline-flex;"></div>');

    var img = $(`<img id="${audioImgBtnId}" class="dynamic" data-uuid="${uuid}" style="${audioImgStyle}; width:20px;height:20px;"/>`);
    img.attr('src', NSNoNameButtonURL);

    var audioDiv = $(`<audio class="audio-btn" id="${playerId}" style="margin-left: 5px;margin-bottom: 10px;vertical-align: middle;"></audio>`); //Equivalent: $(document.createElement('img'))
    var imgAud = img.add(audioDiv);
    var imgDiv = $(btnDiv).append(imgAud);

    //Info Btn and Div
    var infoDiv = $('<div aria-label="Click for more info" data-balloon-pos="up" style="display: inline-flex;"></div>'); //Equivalent: $(document.createElement('img'))
    var infoIcon = $(`<img id="${infoImgId}" class="info-class get-bigger" style="${infoImgStyle}"/>`);
    infoIcon.attr('src', "../assets/images/no-name-info.svg");

    var infoDiv = $(infoDiv).append(infoIcon);

    //Combine audio and info btn and put it on a master div
    var audioSeg = imgDiv.add(infoDiv);
    var audioCombo = $(mainDiv).append(audioSeg);

    const NSMainButtonURL = "../assets/images/ns-main-audio.svg";
    const NSCancelIconURL = "../assets/images/card-cancel-icon.svg";
    const NSAddIconURL = "../assets/images/add-icon.svg";

    let cardSeg = `<div id="${cardId}" class="ns-card" style="${cardPosition}">`;
    cardSeg += '<div class="ns-card-content">';
    //cancel button
    cardSeg += '<div class="ns-card-cancel-box" aria-label="Close info card!" data-balloon-pos="up">';
    cardSeg += `<img src=${NSCancelIconURL} id="${cardCancelId}" class="ns-card-cancel-icon" style="width:12px;height:12px;"/>`;
    cardSeg += '</div>';
    //main button
    cardSeg += '<div class="main-audio" data-balloon-pos="up" style="margin-top:-5px;">';
    cardSeg += `<img src=${NSMainButtonURL} id="${cardAudioBtnId}" data-uuid="${uuid}" class="main-audio-btn" style="width:50px;height:36px;opacity:0.3;"/>`;
    cardSeg += `<audio id="${cardPlayerId}"></audio>`;
    cardSeg += '</div>';
    //full name
    cardSeg += '<div class="full-name">';
    cardSeg += nameToQuery;
    cardSeg += '</div>';
    //phonetic name - not found
    cardSeg += '<div class="phonetic" style="margin-bottom:6px;">';
    cardSeg += "This name is not found";
    cardSeg += '</div>';
    //request name button
    cardSeg += `<a href="https://app2.nameshouts.com/names/all-languages/pronounce-${nameToQuery}" target="_blank" style="color: #333333; font-family: DM-Sans-Medium, sans-serif; font-style: normal; font-weight: 500;" >
    <button style=" text-align:center; background-color: rgba(255,56,96,.2); padding: 10px 10px; width: 240px; border: none; border-radius: 5px;">
    <img src=${NSAddIconURL} id="${addIconId}" class="ns-add-icon" style="vertical-align:sub; margin-right:8px;"/>Request this name</button></a>`;

    cardSeg += '</div>';
    cardSeg += '</div>';


    var totalCombo = $(audioCombo).add(cardSeg);
    $(`#${preLoadBtnId}`).replaceWith(totalCombo);
}


function noSearchUpgrade(preLoadBtnId, audioImgBtnId, audioImgStyle, playerId, infoImgId, infoImgStyle, cardId, cardPosition, cardCancelId, cardAudioBtnId, cardPlayerId) {
    const NSLogOutStateURL = "../assets/images/logged-out-state-icon.svg";
    var mainDiv = $('<div class="ns-audio-btn" style="display: inline-flex; vertical-align: middle;"></div>');
    //Audio Btn and Div
    var btnDiv = $('<div class="wrap-div" aria-label="No search left." data-balloon-pos="up" style="display: inline-flex;"></div>');
    var img = $(`<img id="${audioImgBtnId}" class="dynamic" style="${audioImgStyle}; width:20px;height:20px;"/>`);
    img.attr('src', NSLogOutStateURL);
    var audioDiv = $(`<audio class="audio-btn" id="${playerId}" style="margin-left: 5px;margin-bottom: 10px;vertical-align: middle;"></audio>`); //Equivalent: $(document.createElement('img'))
    var imgAud = img.add(audioDiv);
    var imgDiv = $(btnDiv).append(imgAud);
    //Info Btn and Div
    var infoDiv = $('<div aria-label="Click for more info" data-balloon-pos="up" style="display: inline-flex;"></div>'); //Equivalent: $(document.createElement('img'))
    var infoIcon = $(`<img id="${infoImgId}" class="info-class get-bigger" style="${infoImgStyle}" />`);
    infoIcon.attr('src', "../assets/images/logged-out-state-info.svg");
    var infoDiv = $(infoDiv).append(infoIcon);
    //Combine audio and info btn and put it on a master div
    var audioSeg = imgDiv.add(infoDiv);
    var audioCombo = $(mainDiv).append(audioSeg);
    const NSCancelIconURL = "../assets/images/card-cancel-icon.svg";
    const NSUpgradeIconURL = "../assets/images/no-search-upgrade.svg";
    let cardSeg = `<div id="${cardId}" class="ns-card" style="${cardPosition}">`;
    cardSeg += '<div class="ns-card-content" style="position:relative;">';
    //cancel button
    cardSeg += '<div class="ns-card-cancel-box" aria-label="Close info card!" data-balloon-pos="up">';
    cardSeg += `<img src=${NSCancelIconURL} id="${cardCancelId}" class="ns-card-cancel-icon" style="width:12px;height:12px; margin-right: 17px;"/>`;
    cardSeg += '</div>';
    //alert button
    cardSeg += '<div class="main-audio" data-balloon-pos="up" style="margin-top:-5px;">';
    cardSeg += `<img src=${NSUpgradeIconURL} id="${cardAudioBtnId}" class="main-audio-btn"" style="margin-top:10px; opacity:0.7;"/>`;
    cardSeg += `<audio id="${cardPlayerId}"></audio>`;
    cardSeg += '</div>';
    //alert to log in
    cardSeg += '<div class="phonetic" style="font-size: 15px; font-weight:400;">';
    cardSeg += `<p style="margin: 10px 8px 0px 8px;">You've reached your search limit.</p>`;
    cardSeg += `<p style="margin: 10px 8px 0px 8px;">Let's talk about <a href="https://app2.nameshouts.com/login" target="_blank" style="color: #1f8098; text-decoration-line: underline; font-weight:600;">upgrading</a>your NameShouts plan.</p>`;
    cardSeg += '</div>';
    cardSeg += '</div>';
    cardSeg += '</div>';
    var totalCombo = $(audioCombo).add(cardSeg);
    $(`#${preLoadBtnId}`).replaceWith(totalCombo);
}


class NameFetcher {
    async fetch(source, languageInformation, nameToQuery) {
        let nameList = [];

        if (source !== 9999) {
            nameList = await this.fetchNameFromPrivateList(source, languageInformation, nameToQuery);
        }

        if (nameList.length == 0) {
            nameList = await this.fetchNameFromDefaultList(languageInformation, nameToQuery);
        }

        return nameList;
    }

    async fetchNameFromDefaultList(languageInformation, nameToQuery) {
        const searchNameResult = await fetchData({ nameToSearch: nameToQuery });

        const mainSearchResults = searchNameResult.main_res_array;
        const nameDetailResults = searchNameResult.name_res_array;

        const supportedLanguages = Object.entries(mainSearchResults)
            .filter(item => item[1]['all_names_found'])
            .map(item => parseInt(item[0]));



        const nameGroupByLanguageId = Object.values(nameDetailResults)
            .flatMap(item => item)
            .filter(item => supportedLanguages.includes(item.language_id))
            .reduce((prev, current) => {
                const nameInformation = prev[current.language_id] ?? {
                    name: [],
                    phonetic: [],
                    path: []
                };
                (nameInformation.name ?? []).push(current.name);
                (nameInformation.phonetic ?? []).push(current.name_phonetic);
                (nameInformation.path ?? []).push(current.path_directory);
                nameInformation.language_id = current.language_id;
                nameInformation.lang_name = languageInformation[current.language_id]['lang_name'];
                prev[current.language_id] = nameInformation;

                return prev;
            }, {});

        return Object.values(nameGroupByLanguageId);
    }

    async fetchNameFromPrivateList(source, languageInformation, nameToQuery) {
        const searchNameResult = await fetchData({ loadListNames: nameToQuery, source });
        if (searchNameResult === undefined) return []
        const nameDetailResults = searchNameResult.names;

        const supportedLanguages = nameDetailResults.length > 0 ? [nameDetailResults[0].language_id] : []


        const nameGroupByLanguageId = Object.values(nameDetailResults)
            .flatMap(item => item)
            .filter(item => supportedLanguages.includes(item.language_id))
            .reduce((prev, current) => {
                const nameInformation = prev[current.language_id] ?? {
                    name: [],
                    phonetic: [],
                    path: []
                };
                (nameInformation.name ?? []).push(current.name);
                (nameInformation.phonetic ?? []).push(current.name_phonetic);
                (nameInformation.path ?? []).push(current.path_directory);
                nameInformation.language_id = current.language_id;
                nameInformation.lang_name = languageInformation[current.language_id]['lang_name'];
                prev[current.language_id] = nameInformation;

                return prev;
            }, {});

        return Object.values(nameGroupByLanguageId);
    }
}



class Facade {
    async fetchNameList(source, nameToQuery) {
        const nameFetcher = new NameFetcher();
        const languageInformationGroupedById = await this.fetchLanguageInformationGroupedById();

        return await nameFetcher.fetch(source, languageInformationGroupedById, nameToQuery);
    }


    async fetchLanguageInformationGroupedById() {
        let languageInformation = await fetchData({ loadLangs: true });

        const languageInformationGroupedById = languageInformation.data.reduce((previous, current) => {
            previous[current.lang_id] = current;
            return previous;
        }, {});

        return languageInformationGroupedById;
    }
}


function fetchData(inputData) {
    return new Promise((resolve) => {
        if (inputData.loadLangs) {

            const myHeaders = new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            });

            const base_url = `${API_BASE_URL}/lang`;

            fetch(base_url, {
                method: 'GET',
                headers: myHeaders,
            }).then(response => response.json())
                .then((data) => {
                    resolve(data);
                })
                .catch((error) => {
                    console.error(error);

                });


        }
        else if (inputData.nameToSearch !== undefined && inputData.nameToSearch.length > 0) {
            let nameQuery = inputData.nameToSearch.replace(/\s/g, "-");
            const myHeaders = new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            });

            const base_url = `${API_BASE_URL}/name/${nameQuery}`;

            fetch(base_url, {
                method: 'GET',
                headers: myHeaders,
            }).then(response => response.json())
                .then((data) => {
                    resolve(data);
                })
                .catch((error) => {
                    console.error(error);

                });
        }
        else if (inputData.loadListNames !== undefined && inputData.loadListNames.length > 0) {
            let nameQuery = inputData.loadListNames.replace(/\s/g, "-");
            const myHeaders = new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            });
            const base_url = `${API_BASE_URL}/user/user-list/get-name-group-from-user-list?user_list_id=${inputData.source}&name=${nameQuery}`;

            fetch(base_url, {
                method: 'GET',
                headers: myHeaders,
            }).then(response => response.json())
                .then((data) => {
                    resolve(data[0]);
                })
                .catch((error) => {
                    resolve([])
                    console.error(error);

                });
        }
    });
}


function closeCards(cardIdToSkip) {
    const allOpenCards = document.getElementsByClassName('ns-card');
    for (let i = 0; i < allOpenCards.length; i++) {
        const card = allOpenCards[i];
        if (card.id != cardIdToSkip) {
            $(`#${card.id}`).hide();
        }
    }
}


function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if (d > 0) {//Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}