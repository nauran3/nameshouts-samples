# Nameshouts Integration Samples
## Demo Samples
📍 [Webpage with a Single Name](https://single-name-integration-nameshouts.netlify.app/)  
📍 [Webpage with Multiple Names](https://multiple-names-integration-nameshouts.netlify.app/)
## Availing Access Token
- Head over to https://www.nameshouts.com/
- After signing in, Select "Integrations" option from the sidebar.![Integrations Menu](https://www.brainlytic.org/images/98a11d4b-94e4-4ca6-a73c-f1536cf5ac961714741371070.png
)
- Now, Click on the "Get Started" button of "Nameshouts API" integration card. ![Integrations Menu](https://www.brainlytic.org/images/942a4343-f639-4c97-96b7-320e6ef88dde1714741286614.png
)
- Now, Click on the "Create a Token" hyperlink, you'll get a prompt to enter your token's name, after entering a name, click on the "Continue" button.![Integrations Menu](https://www.brainlytic.org/images/db3d4edb-e417-40c7-b5a8-e63f093562091714741493127.png
)![Integrations Menu](https://www.brainlytic.org/images/6f8838d2-4537-47fc-9cc1-076c83b85fa01714741531636.png
)
- You'll now get a newly created token, click on the "Copy" button and save the access token for future reference.![Integrations Menu](https://www.brainlytic.org/images/5088df57-dfb7-4e55-b09b-bdc1a43114031714741638705.png
)
## Integrating to a single name containing webpage
- Head over to the "single name sample" folder for reference.
- First, copy the `assets` folder of this repo to your project folder.
- Import the `assets/content.css` file in the `<head>` section of your html file, in our sample file, it's imported using the following code in the `index.html`:
    ```
    <!-- Nameshouts Code -->
        <link rel="stylesheet" href="../assets/css/content.css">
    <!-- End Nameshouts Code -->
    ```
- Then for the javascript code, import jquery.
    ```
        <!-- Nameshouts Code -->
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script src="nameshouts.js"></script>
        <!-- Nameshouts Code -->
    ```
- Now in your javascript (in our sample, it's in the `nameshouts.js` file), first update the value of `ACCESS_TOKEN` identifier using your access token.
- Modify the `_DEFAULT_DATA_STORE_PORT` identifier value if needed. If the value is set to `9999`, then names will be fetched from the default list, otherwise, if you want any of your own lists to be fetched from, replace the value of `_DEFAULT_DATA_STORE_PORT` with the `listId` (Which can be found in the browser URL when you enter into a particular list).
- Identify the HTML element which contains the name using jquery annotation, you can adjust or play around with the CSS properties of the icon that'll appear beside the name as well as the popped up card position by modifying the following lines of codes:
    ```
    var nameTag = $("h1[itemprop='name']");
    nameTag.css('display', 'inline-flex');
    var nameToQuery = nameTag.text().trim();
    var cssStyle = 'display:inline-flex;margin-left: 5px;margin-bottom: 4px;vertical-align: middle;';
    var audioImgStyle = 'margin-left: 5px;margin-bottom: 10px;vertical-align: middle;height:24px;width:24px;';
    var infoImgStyle = 'margin-left: -8px;margin-bottom: -7px;vertical-align: middle; width: 12px !important;height: 12px !important;';
    const cardPosition = 'position: absolute; display: inline-block; margin-top: 145px !important;margin-left: 130px !important;';
    ```
- This code will work for asynchronous fetching or lazy loading of the name containing element also as `mutationObserver` is implemented.
## Integrating to a multiple names containing webpage
- Head over to the "multiple names sample" folder for reference.
- First, copy the `assets` folder of this repo to your project folder.
- Import the `assets/content.css` file in the `<head>` section of your html file, in our sample file, it's imported using the following code in the `index.html`:
    ```
    <!-- Nameshouts Code -->
        <link rel="stylesheet" href="../assets/css/content.css">
    <!-- End Nameshouts Code -->
    ```
- Then for the javascript code, import jquery and jquery-ui.
    ```
        <!-- Nameshouts Code -->
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
        <script src="nameshouts.js"></script>
        <!-- Nameshouts Code -->
    ```
- Now in your javascript (in our sample, it's in the `nameshouts.js` file), first update the value of `ACCESS_TOKEN` identifier using your access token.
- Modify the `_DEFAULT_DATA_STORE_PORT` identifier value if needed. If the value is set to `9999`, then names will be fetched from the default list, otherwise, if you want any of your own lists to be fetched from, replace the value of `_DEFAULT_DATA_STORE_PORT` with the `listId` (Which can be found in the browser URL when you enter into a particular list).
- Identify the common but uniquely identifiable attribute of the HTML elements those contain the names using jquery annotation (in our example, it's `$("h4[itemprop='name']").each(...)`), you can adjust or play around with the CSS properties of the icon that'll appear beside each of the names as well as the popped up card position by modifying the following lines of codes:
    ```
    nameTag.css('display', 'inline-flex');
    var nameToQuery = nameTag.text().trim();
    var cssStyle = 'display:inline-flex;margin-left: 5px;margin-bottom: 4px;vertical-align: middle;';
    var audioImgStyle = 'margin-left: 5px;margin-bottom: 10px;vertical-align: middle;height:24px;width:24px;';
    var infoImgStyle = 'margin-left: -8px;margin-bottom: -7px;vertical-align: middle; width: 12px !important;height: 12px !important;';
    const cardPosition = 'position: absolute; display: inline-block; margin-top: 145px !important;margin-left: 130px !important;';
    ```
- This code will work for asynchronous fetching or lazy loading of the names individually as `mutationObserver` is implemented.

## How does it work ?
-  If the value of `_DEFAULT_DATA_STORE_PORT` identifier is set to `9999`, then names will be fetched from the default list, otherwise, if you want any of your own lists to be fetched from, replace the value of `_DEFAULT_DATA_STORE_PORT` with the `listId` (Which can be found in the browser URL when you enter into a particular list).
- In `nameshouts.js`, there're 2 functions dedicated for either case:
    - `fetchNameFromPrivateList(...)`
        - When `_DEFAULT_DATA_STORE_PORT` is set to a listId other than 9999, this function is called. It calls `fetchData(...)` method with argument having `loadListNames` field, inside of the `fetchData(...)` method, for this specific case, you'll see the below API call:
            ```
            const myHeaders = new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            });
            const base_url = `${API_BASE_URL}/user/user-list/get-name-group-from-user-list?user_list_id=${inputData.source}&name=${nameQuery}`;

            fetch(base_url, {
                method: 'GET',
                headers: myHeaders,
            })
            ```
            The route for the above API call is `${API_BASE_URL}/user/user-list/get-name-group-from-user-list` which has 3 query parameters:
            - `user_list_id` : The user list id in which the name would be searched.
            - `name` : The name to be searched
            - `email` (Optional) : The email address of the person having the name. This parameter is necessary in the below senarios:
                - When a list contains multiple people with the same name and it is required to specify.
                - When it is required to fetch the custom recording (if it exists) of the name by that name's holder.
                    ### Email parameter is not relevant for combo names.
            
            For a name that is recorded by a user, the response object's `is_custom` flag will be set to true. The response object for a custom name has slightly different attributes compared to that of a name from the NameShouts database.
            - If the `is_custom` is true and it is required to fetch the user recorded audio for that name, the `email` query parameter must be set while making the api call.
            - Response objects for user recorded names and nameshouts recorded ones are a bit different in these below fields:
                -  `phonetic` vs `name_phonetic`
                - There is no `language_id` field for custom recorded names' response, those have `language_of_origin` field instead.
                - The value of the `path_directory` field contains audio file extension (`.mp3`) for custom recorded names whereas Nameshouts recorded ones don't. 
            
            These were the key differences for implementation for which the changes in implementations can be seen in `fetchNameFromPrivateList()` method. If  you want to have a look on the full response objects, head over to `Sample API Responses` folder of this repository.
            ### In order to be familiar with the different attributes for the user recorded names and the regular ones, head over to [Nameshouts 2.0 API Documentation](https://documenter.getpostman.com/view/1200138/VUjPJ5xc#dc4068d1-b087-45c1-9f9a-6b1ee551a787). You can handle client UI/UX for different cases by following the API documentation irrespective of your stack.
        - If the name is not found in the private list, then it is searched in the default list as a fallback option which is covered in the below lines of code of `nameshouts.js`:
            ```
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
                .
                .
                .
            }
            ```

    - `fetchNameFromDefaultList(...)`
        -  On the other hand, When `_DEFAULT_DATA_STORE_PORT` is set to a 9999, this function is called. It works similarly as `fetchNameFromPrivateList(...)` but it makes the below API call instead (in the `fetchData(...)` function):
            ```
            let nameQuery = inputData.nameToSearch.replace(/\s/g, "-");
            const myHeaders = new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            });

            const base_url = `${API_BASE_URL}/name/${nameQuery}`;

            fetch(base_url, {
                method: 'GET',
                headers: myHeaders,
            })
            ```
            Rest of the logics are similar to that of `fetchNameFromPrivateList(...)`.