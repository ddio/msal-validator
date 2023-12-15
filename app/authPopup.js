// Create the main myMSALObj instance
// configuration parameters are located at authConfig.js
let myMSALObj = null;

let username = "";

const MSAL_CONFIG_KEY = "misoMsalConfig";

function loadConfig() {
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get("clientId");
    const authority = urlParams.get("authority");

    if (clientId && authority) {
        const config = { clientId, authority }
        saveConfig(config);
        return config;
    }

    try {
        const config = JSON.parse(sessionStorage.getItem(MSAL_CONFIG_KEY));
        if (config.clientId && config.authority) {
            return {
                clientId: config.clientId,
                authority: config.authority
            }
        }
    } catch (e) {
        // acceptable
    }
    return null;
}

function saveConfig(config) {
    if (config && config.clientId && config.authority) {
        config = {
            clientId: config.clientId,
            authority: config.authority
        }
        sessionStorage.setItem(MSAL_CONFIG_KEY, JSON.stringify(config));

        // Publish parameters to URL search parameters
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set("clientId", config.clientId);
        urlParams.set("authority", config.authority);
        window.history.replaceState(null, null, `?${urlParams.toString()}`);

        // Update UI form value
        document.getElementById("clientId").value = config.clientId;
        document.getElementById("tenantId").value = config.authority;
    }
}

function initConfig () {
    const config = loadConfig();
    if (config && config.clientId && config.authority) {
        resetMsalConfig(config);
        saveConfig(config)
        return true
    }
}

function updateConfig () {
    const config = {
        clientId: document.getElementById("clientId").value,
        authority: document.getElementById("tenantId").value
    }

    resetMsalConfig(config);
    saveConfig(config);
}

function resetMsalConfig (config) {
    msalConfig.auth.clientId = config.clientId;
    msalConfig.auth.authority = `https://login.microsoftonline.com/${config.authority}`;
    myMSALObj = new msal.PublicClientApplication(msalConfig);
    enableSignInButton();
}

function selectAccount() {

    /**
     * See here for more info on account retrieval: 
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
     */
    // if (!myMSALObj) {
    //     myMSALObj = new msal.PublicClientApplication(msalConfig);
    // }
    // console.log('??', myMSALObj)
    const currentAccounts = myMSALObj.getAllAccounts();
    if (currentAccounts.length === 0) {
        return;
    } else if (currentAccounts.length > 1) {
        // Add choose account code here
        console.warn("Multiple accounts detected.");
    } else if (currentAccounts.length === 1) {
        username = currentAccounts[0].username;
        showWelcomeMessage(username);
    }
}

function handleResponse(response) {

    /**
     * To see the full list of response object properties, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#response
     */

    if (response !== null) {
        username = response.account.username;
        showWelcomeMessage(username);
    } else {
        selectAccount();
    }
}

function signIn() {

    /**
     * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
     */

    myMSALObj.loginPopup(loginRequest)
        .then(handleResponse)
        .catch(error => {
            console.error(error);
        });
}

function signOut() {

    /**
     * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
     */

    const logoutRequest = {
        account: myMSALObj.getAccountByUsername(username),
        postLogoutRedirectUri: msalConfig.auth.redirectUri,
        mainWindowRedirectUri: msalConfig.auth.redirectUri
    };

    myMSALObj.logoutPopup(logoutRequest);
}

function getTokenPopup(request) {

    /**
     * See here for more info on account retrieval: 
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
     */
    request.account = myMSALObj.getAccountByUsername(username);
    
    return myMSALObj.acquireTokenSilent(request)
        .catch(error => {
            console.warn("silent token acquisition fails. acquiring token using popup");
            if (error instanceof msal.InteractionRequiredAuthError) {
                // fallback to interaction when silent call fails
                return myMSALObj.acquireTokenPopup(request)
                    .then(tokenResponse => {
                        console.log(tokenResponse);
                        return tokenResponse;
                    }).catch(error => {
                        console.error(error);
                    });
            } else {
                console.warn(error);   
            }
    });
}

if (initConfig()) {
    selectAccount()
}
// selectAccount()
