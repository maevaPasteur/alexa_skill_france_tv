// Lambda Function code for Alexa.
// Paste this into your index.js file.

const Alexa = require("ask-sdk");
const https = require("https");


function httpGet(path) {
    return new Promise(((resolve, reject) => {
        var options = {
            host: 'gentle-badlands-67442.herokuapp.com',
            port: 443,
            path: path,
            method: 'GET',
        };

    const request = https.request(options, (response) => {
        response.setEncoding('utf8');
    let returnData = '';

    response.on('data', (chunk) => {
        returnData += chunk;
});

    response.on('end', () => {
        resolve(JSON.parse(returnData));
});

    response.on('error', (error) => {
        reject(error);
});
});
    request.end();
}));
}

const invocationName = "france tv";

// Session Attributes
//   Alexa will track attributes for you, by default only during the lifespan of your session.
//   The history[] array will track previous request(s), used for contextual Help/Yes/No handling.
//   Set up DynamoDB persistence to have the skill save and reload these attributes between skill sessions.

function getMemoryAttributes() {   const memoryAttributes = {
    "history":[],

    // The remaining attributes will be useful after DynamoDB persistence is configured
    "launchCount":0,
    "lastUseTimestamp":0,

    "lastSpeechOutput":{},
    "nextIntent":[]

    // "favoriteColor":"",
    // "name":"",
    // "namePronounce":"",
    // "email":"",
    // "mobileNumber":"",
    // "city":"",
    // "state":"",
    // "postcode":"",
    // "birthday":"",
    // "bookmark":0,
    // "wishlist":[],
};
    return memoryAttributes;
};

const maxHistorySize = 20; // remember only latest 20 intents


// 1. Intent Handlers =============================================

const AMAZON_CancelIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.CancelIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


        let say = 'Okay, à très vite! ';

        return responseBuilder
            .speak(say)
            .withShouldEndSession(true)
            .getResponse();
    },
};

const AMAZON_HelpIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let intents = getCustomIntents();
        let sampleIntent = randomElement(intents);

        let say = 'Tu veux profiter pleinement de France Tv ? Demande moi de mettre pause ou play, avancer ou reculer dans la vidéo, choisir la caméra de ton choix ou encore afficher toutes les caméras disponibles. Que puis-je faire pour toi ?';

        // let previousIntent = getPreviousIntent(sessionAttributes);
        // if (previousIntent && !handlerInput.requestEnvelope.session.new) {
        //     say += 'Your last intent was ' + previousIntent + '. ';
        // }
        // say +=  'I understand  ' + intents.length + ' intents, '

        // say += ' Here something you can ask me, ' + getSampleUtterance(sampleIntent);

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_StopIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StopIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


        let say = 'D\'accord, à bientôt ! ';

        return responseBuilder
            .speak(say)
            .withShouldEndSession(true)
            .getResponse();
    },
};

const AMAZON_NavigateHomeIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NavigateHomeIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.NavigateHomeIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const GetCamera_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'GetCamera' ;
    },
    async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    let say = '';

    let slotStatus = '';
    let resolvedSlot;

    let slotValues = getSlotValues(request.intent.slots);
    // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

    // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
    //   SLOT: camera
    if (slotValues.camera.heardAs) {
        slotStatus += ' Très bien, voici la camera ' + slotValues.camera.heardAs + '. ';
        const response = await httpGet('/api/camera/'+ slotValues.camera.heardAs);
        console.log(response);
    } else {
        slotStatus += 'Mince, cette caméra n\'est pas diponible. N\'hésite pas à me demander d\'affichr la mosaique pour voir toutes les caméras. ';
    }
    if (slotValues.camera.ERstatus === 'ER_SUCCESS_MATCH') {
        slotStatus += 'a valid ';
        if(slotValues.camera.resolved !== slotValues.camera.heardAs) {
            slotStatus += 'synonym for ' + slotValues.camera.resolved + '. ';
        } else {
            slotStatus += 'match. '
        } // else {
        //
    }
    if (slotValues.camera.ERstatus === 'ER_SUCCESS_NO_MATCH') {
        slotStatus += 'which did not match any slot value. ';
        console.log('***** consider adding "' + slotValues.camera.heardAs + '" to the custom slot type used by slot camera! ');
    }

    if( (slotValues.camera.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.camera.heardAs) ) {
        slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('GetCamera','camera'), 'or');
    }

    say += slotStatus;


    return handlerInput.responseBuilder
        .speak(say)
        .reprompt('essaye encore, ' + say)
        .getResponse();
},
};

const GetMatch_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'GetMatch' ;
    },
    async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const response = await httpGet('/api/match/switch');
    let say = 'Biensure, voici un nouveau match ! ';

    return handlerInput.responseBuilder
        .speak(say)
        .reprompt('try again, ' + say)
        .getResponse();
},
};

const ActionPause_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'ActionPause' ;
    },
    async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    let say = 'C\'est fait, prenez donc une pause. ';
    const response = await httpGet('/api/controls/1');

    return handlerInput.responseBuilder
        .speak(say)
        .reprompt('try again, ' + say)
        .getResponse();
},
};

const ActionPlay_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'ActionPlay' ;
    },
    async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    let say = 'C\'est reparti ! ';
    const response = await httpGet('/api/controls/0');

    return handlerInput.responseBuilder
        .speak(say)
        .reprompt('try again, ' + say)
        .getResponse();
},
};

const ActionAutoMode_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'ActionAutoMode' ;
    },
    async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const response = await httpGet('/api/camera/direct');

    let say = 'D\'accord, profite à nouveau du mode automatique. ';

    return handlerInput.responseBuilder
        .speak(say)
        .reprompt('try again, ' + say)
        .getResponse();
},
};

const GoBefore_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'GoBefore' ;
    },
    async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    let say = 'Voilà';
    const response = await httpGet('/api/controls/7');

    return handlerInput.responseBuilder
        .speak(say)
        .reprompt('try again, ' + say)
        .getResponse();
},
};

const GoAfter_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'GoAfter' ;
    },
    async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    let say = 'C\'est fait. ';
    const response = await httpGet('/api/controls/6');

    return handlerInput.responseBuilder
        .speak(say)
        .reprompt('try again, ' + say)
        .getResponse();
},
};

const GetInfosActualMatch_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'GetInfosActualMatch' ;
    },
    async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const response = await httpGet('/api/match/0');

    let say ='';

    return handlerInput.responseBuilder
        .speak(response.match.title)
        .reprompt("What would you like?")
        .getResponse();
},
};

const GetAllCamera_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'GetAllCamera' ;
    },
    async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const response = await httpGet('/api/camera/all');

    let say ='Biensure, voici les caméras disponibles. Tu peux me dire de revenir au mode automatique ou de visualiser la caméra de ton choix.';

    return handlerInput.responseBuilder
        .speak(say)
        .reprompt("What would you like?")
        .getResponse();
},
};

const GetHelp_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'GetHelp' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Tu veux profiter pleinement de France Tv ? Demande moi de mettre pause ou play, avancer ou reculer dans la vidéo, choisir la caméra de ton choix ou encore afficher toutes les caméras disponibles. Que puis-je faire pour toi ?';

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const ChangeCamera_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'ChangeCamera' ;
    },
    async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    let say = 'Voilà un nouvel angle ! ';

    const response = await httpGet('/api/controls/2');

    return handlerInput.responseBuilder
        .speak(say)
        .reprompt('Essaye à nouveau')
        .getResponse();
},
};

const Zoom_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'Zoom' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'D\'accord';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const Dezoom_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'Dezoom' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Okay';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const GetScore_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'GetScore' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Le score est de 40 pour Toulouse, et 20 pour Rennes';

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_MoreIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.MoreIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.MoreIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_NavigateSettingsIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NavigateSettingsIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.NavigateSettingsIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_NextIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NextIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.NextIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_PageUpIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.PageUpIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.PageUpIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_PageDownIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.PageDownIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.PageDownIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_PreviousIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.PreviousIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.PreviousIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_ScrollRightIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.ScrollRightIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.ScrollRightIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_ScrollDownIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.ScrollDownIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.ScrollDownIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_ScrollLeftIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.ScrollLeftIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.ScrollLeftIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_ScrollUpIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.ScrollUpIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.ScrollUpIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};


const LaunchRequest_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const responseBuilder = handlerInput.responseBuilder;

        let say = 'Bonjour et bienvenue sur ' + invocationName + ' ! N\'hésite pas à me demander si tu as besoin d\'aide.';

        let skillTitle = capitalize(invocationName);

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .withStandardCard('Bonjour',
                'Bienvenue John sur le service de ' + skillTitle,
                welcomeCardImg.smallImageUrl, welcomeCardImg.largeImageUrl)
            .getResponse();
    },
};

const SessionEndedHandler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler =  {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const request = handlerInput.requestEnvelope.request;

        console.log(`Error handled: ${error.message}`);
        // console.log(`Original Request was: ${JSON.stringify(request, null, 2)}`);

        return handlerInput.responseBuilder
            .speak('Désolé, je rencontre un petit soucis. Essaye à nouveau.')
            .reprompt('Désolé, je rencontre un petit soucis. Essaye à nouveau.')
            .getResponse();
    }
};


// 2. Constants ===========================================================================

// Here you can define static data, to be used elsewhere in your code.  For example:
//    const myString = "Hello World";
//    const myArray  = [ "orange", "grape", "strawberry" ];
//    const myObject = { "city": "Boston",  "state":"Massachusetts" };

const APP_ID = undefined;  // TODO replace with your Skill ID (OPTIONAL).

// 3.  Helper Functions ===================================================================

function capitalize(myString) {

    return myString.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); }) ;
}


function randomElement(myArray) {
    return(myArray[Math.floor(Math.random() * myArray.length)]);
}

function stripSpeak(str) {
    return(str.replace('<speak>', '').replace('</speak>', ''));
}




function getSlotValues(filledSlots) {
    const slotValues = {};

    Object.keys(filledSlots).forEach((item) => {
        const name  = filledSlots[item].name;

    if (filledSlots[item] &&
        filledSlots[item].resolutions &&
        filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
        filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
        filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
        switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
            case 'ER_SUCCESS_MATCH':
                slotValues[name] = {
                    heardAs: filledSlots[item].value,
                    resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
                    ERstatus: 'ER_SUCCESS_MATCH'
                };
                break;
            case 'ER_SUCCESS_NO_MATCH':
                slotValues[name] = {
                    heardAs: filledSlots[item].value,
                    resolved: '',
                    ERstatus: 'ER_SUCCESS_NO_MATCH'
                };
                break;
            default:
                break;
        }
    } else {
        slotValues[name] = {
            heardAs: filledSlots[item].value,
            resolved: '',
            ERstatus: ''
        };
    }
}, this);

    return slotValues;
}

function getExampleSlotValues(intentName, slotName) {

    let examples = [];
    let slotType = '';
    let slotValuesFull = [];

    let intents = model.interactionModel.languageModel.intents;
    for (let i = 0; i < intents.length; i++) {
        if (intents[i].name == intentName) {
            let slots = intents[i].slots;
            for (let j = 0; j < slots.length; j++) {
                if (slots[j].name === slotName) {
                    slotType = slots[j].type;

                }
            }
        }

    }
    let types = model.interactionModel.languageModel.types;
    for (let i = 0; i < types.length; i++) {
        if (types[i].name === slotType) {
            slotValuesFull = types[i].values;
        }
    }


    examples.push(slotValuesFull[0].name.value);
    examples.push(slotValuesFull[1].name.value);
    if (slotValuesFull.length > 2) {
        examples.push(slotValuesFull[2].name.value);
    }


    return examples;
}

function sayArray(myData, penultimateWord = 'and') {
    let result = '';

    myData.forEach(function(element, index, arr) {

        if (index === 0) {
            result = element;
        } else if (index === myData.length - 1) {
            result += ` ${penultimateWord} ${element}`;
        } else {
            result += `, ${element}`;
        }
    });
    return result;
}
function supportsDisplay(handlerInput) // returns true if the skill is running on a device with a display (Echo Show, Echo Spot, etc.)
{                                      //  Enable your skill for display as shown here: https://alexa.design/enabledisplay
    const hasDisplay =
        handlerInput.requestEnvelope.context &&
        handlerInput.requestEnvelope.context.System &&
        handlerInput.requestEnvelope.context.System.device &&
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display;

    return hasDisplay;
}


const welcomeCardImg = {
    smallImageUrl: "https://sport.francetvinfo.fr//snp-assets/images/logo-ftvsport-lg.svg",
    largeImageUrl: "https://sport.francetvinfo.fr//snp-assets/images/logo-ftvsport-lg.svg"
};

const DisplayImg1 = {
    title: 'Jet Plane',
    url: 'https://s3.amazonaws.com/skill-images-789/display/plane340_340.png'
};
const DisplayImg2 = {
    title: 'Starry Sky',
    url: 'https://s3.amazonaws.com/skill-images-789/display/background1024_600.png'

};

function getCustomIntents() {
    const modelIntents = model.interactionModel.languageModel.intents;

    let customIntents = [];


    for (let i = 0; i < modelIntents.length; i++) {

        if(modelIntents[i].name.substring(0,7) != "AMAZON." && modelIntents[i].name !== "LaunchRequest" ) {
            customIntents.push(modelIntents[i]);
        }
    }
    return customIntents;
}

function getSampleUtterance(intent) {

    return randomElement(intent.samples);

}

function getPreviousIntent(attrs) {

    if (attrs.history && attrs.history.length > 1) {
        return attrs.history[attrs.history.length - 2].IntentRequest;

    } else {
        return false;
    }

}

function getPreviousSpeechOutput(attrs) {

    if (attrs.lastSpeechOutput && attrs.history.length > 1) {
        return attrs.lastSpeechOutput;

    } else {
        return false;
    }

}

function timeDelta(t1, t2) {

    const dt1 = new Date(t1);
    const dt2 = new Date(t2);
    const timeSpanMS = dt2.getTime() - dt1.getTime();
    const span = {
        "timeSpanMIN": Math.floor(timeSpanMS / (1000 * 60 )),
        "timeSpanHR": Math.floor(timeSpanMS / (1000 * 60 * 60)),
        "timeSpanDAY": Math.floor(timeSpanMS / (1000 * 60 * 60 * 24)),
        "timeSpanDesc" : ""
    };


    if (span.timeSpanHR < 2) {
        span.timeSpanDesc = span.timeSpanMIN + " minutes";
    } else if (span.timeSpanDAY < 2) {
        span.timeSpanDesc = span.timeSpanHR + " hours";
    } else {
        span.timeSpanDesc = span.timeSpanDAY + " days";
    }


    return span;

}


const InitMemoryAttributesInterceptor = {
    process(handlerInput) {
        let sessionAttributes = {};
        if(handlerInput.requestEnvelope.session['new']) {

            sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

            let memoryAttributes = getMemoryAttributes();

            if(Object.keys(sessionAttributes).length === 0) {

                Object.keys(memoryAttributes).forEach(function(key) {  // initialize all attributes from global list

                    sessionAttributes[key] = memoryAttributes[key];

                });

            }
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);


        }
    }
};

const RequestHistoryInterceptor = {
    process(handlerInput) {

        const thisRequest = handlerInput.requestEnvelope.request;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let history = sessionAttributes['history'] || [];

        let IntentRequest = {};
        if (thisRequest.type === 'IntentRequest' ) {

            let slots = [];

            IntentRequest = {
                'IntentRequest' : thisRequest.intent.name
            };

            if (thisRequest.intent.slots) {

                for (let slot in thisRequest.intent.slots) {
                    let slotObj = {};
                    slotObj[slot] = thisRequest.intent.slots[slot].value;
                    slots.push(slotObj);
                }

                IntentRequest = {
                    'IntentRequest' : thisRequest.intent.name,
                    'slots' : slots
                };

            }

        } else {
            IntentRequest = {'IntentRequest' : thisRequest.type};
        }
        if(history.length > maxHistorySize - 1) {
            history.shift();
        }
        history.push(IntentRequest);

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    }

};




const RequestPersistenceInterceptor = {
    process(handlerInput) {

        if(handlerInput.requestEnvelope.session['new']) {

            return new Promise((resolve, reject) => {

                handlerInput.attributesManager.getPersistentAttributes()

                .then((sessionAttributes) => {
                sessionAttributes = sessionAttributes || {};


            sessionAttributes['launchCount'] += 1;

            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

            handlerInput.attributesManager.savePersistentAttributes()
                .then(() => {
                resolve();
        })
        .catch((err) => {
                reject(err);
        });
        });

        });

        } // end session['new']
    }
};


const ResponseRecordSpeechOutputInterceptor = {
    process(handlerInput, responseOutput) {

        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let lastSpeechOutput = {
            "outputSpeech":responseOutput.outputSpeech.ssml,
            "reprompt":responseOutput.reprompt.outputSpeech.ssml
        };

        sessionAttributes['lastSpeechOutput'] = lastSpeechOutput;

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    }
};

const ResponsePersistenceInterceptor = {
    process(handlerInput, responseOutput) {

        const ses = (typeof responseOutput.shouldEndSession == "undefined" ? true : responseOutput.shouldEndSession);

        if(ses || handlerInput.requestEnvelope.request.type == 'SessionEndedRequest') { // skill was stopped or timed out

            let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

            sessionAttributes['lastUseTimestamp'] = new Date(handlerInput.requestEnvelope.request.timestamp).getTime();

            handlerInput.attributesManager.setPersistentAttributes(sessionAttributes);

            return new Promise((resolve, reject) => {
                handlerInput.attributesManager.savePersistentAttributes()
                .then(() => {
                resolve();
        })
        .catch((err) => {
                reject(err);
        });

        });

        }

    }
};



// 4. Exports handler function and setup ===================================================
const skillBuilder = Alexa.SkillBuilders.standard();
exports.handler = skillBuilder
    .addRequestHandlers(
        AMAZON_CancelIntent_Handler,
        AMAZON_HelpIntent_Handler,
        AMAZON_StopIntent_Handler,
        AMAZON_NavigateHomeIntent_Handler,
        GetCamera_Handler,
        GetMatch_Handler,
        ActionPause_Handler,
        ActionPlay_Handler,
        ActionAutoMode_Handler,
        GoBefore_Handler,
        GoAfter_Handler,
        GetInfosActualMatch_Handler,
        GetAllCamera_Handler,
        GetHelp_Handler,
        ChangeCamera_Handler,
        Zoom_Handler,
        Dezoom_Handler,
        GetScore_Handler,
        AMAZON_MoreIntent_Handler,
        AMAZON_NavigateSettingsIntent_Handler,
        AMAZON_NextIntent_Handler,
        AMAZON_PageUpIntent_Handler,
        AMAZON_PageDownIntent_Handler,
        AMAZON_PreviousIntent_Handler,
        AMAZON_ScrollRightIntent_Handler,
        AMAZON_ScrollDownIntent_Handler,
        AMAZON_ScrollLeftIntent_Handler,
        AMAZON_ScrollUpIntent_Handler,
        LaunchRequest_Handler,
        SessionEndedHandler
    )
    .addErrorHandlers(ErrorHandler)
    .addRequestInterceptors(InitMemoryAttributesInterceptor)
    .addRequestInterceptors(RequestHistoryInterceptor)

    // .addResponseInterceptors(ResponseRecordSpeechOutputInterceptor)

    // .addRequestInterceptors(RequestPersistenceInterceptor)
    // .addResponseInterceptors(ResponsePersistenceInterceptor)

    // .withTableName("askMemorySkillTable")
    // .withAutoCreateTable(true)

    .lambda();


// End of Skill code -------------------------------------------------------------
// Static Language Model for reference

const model = {
    "interactionModel": {
        "languageModel": {
            "invocationName": "france tv",
            "intents": [
                {
                    "name": "AMAZON.CancelIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.HelpIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.StopIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.NavigateHomeIntent",
                    "samples": []
                },
                {
                    "name": "GetCamera",
                    "slots": [
                        {
                            "name": "camera",
                            "type": "AMAZON.NUMBER"
                        }
                    ],
                    "samples": [
                        "Mets la cam {camera}",
                        "Cam {camera}",
                        "Caméra numérot {camera}",
                        "Caméra {camera}",
                        "Mets la caméra {camera}"
                    ]
                },
                {
                    "name": "GetMatch",
                    "slots": [],
                    "samples": [
                        "Met un autre terrain",
                        "Change de terrain",
                        "Je veux voir un autre match",
                        "Met un autre cours",
                        "Met un autre match",
                        "Change de match"
                    ]
                },
                {
                    "name": "ActionPause",
                    "slots": [],
                    "samples": [
                        "pause",
                        "Stop la vidéo",
                        "Mets pause à la vidéo",
                        "Met pause à la video",
                        "met la video en pause",
                        "arrete la video",
                        "Met pause",
                        "Mets pause"
                    ]
                },
                {
                    "name": "ActionPlay",
                    "slots": [],
                    "samples": [
                        "remet la video",
                        "met play au match",
                        "remet le match",
                        "démarre la video",
                        "joue la video",
                        "rejoue la video",
                        "met play à la video",
                        "mets play",
                        "met play",
                        "Play"
                    ]
                },
                {
                    "name": "ActionAutoMode",
                    "slots": [],
                    "samples": [
                        "Automatique",
                        "Reste en automatique",
                        "Remet le mode automatique",
                        "Mode automatique",
                        "Mode auto",
                        "Mets le mode automatique",
                        "Met le mode auto",
                        "Mets le direct",
                        "Remets le direct"
                    ]
                },
                {
                    "name": "GoBefore",
                    "slots": [],
                    "samples": [
                        "Remonte en arriere",
                        "Remonte",
                        "Retour arriere",
                        "Retour",
                        "Je veux revoir l'action",
                        "Je veux revoir ce qui c'est passé",
                        "Je veux revoir",
                        "Je veux voir ce qui c'est passé avant",
                        "Je veux voir avant",
                        "Va avant",
                        "Retour en arriere",
                        "Va en arrière"
                    ]
                },
                {
                    "name": "GoAfter",
                    "slots": [],
                    "samples": [
                        "Avance la partie",
                        "Avance le match",
                        "Avance la video",
                        "Avance",
                        "Retourne plus tard",
                        "Retourne en avant",
                        "Passe",
                        "Va plus tard",
                        "Va en avant"
                    ]
                },
                {
                    "name": "GetInfosActualMatch",
                    "slots": [],
                    "samples": [
                        "Qui joue",
                        "Qui jouent",
                        "Je veux savoir qui joue",
                        "Que sais-tu sur le match",
                        "C'est quoi ce match",
                        "qu'est ce que je regarde",
                        "C'est quel match",
                        "Dis moi en plus sur le match"
                    ]
                },
                {
                    "name": "GetAllCamera",
                    "slots": [],
                    "samples": [
                        "Qu'elles sont les caméras disponibles",
                        "Montre moi les caméras",
                        "Montre moi toutes les caméras",
                        "Montre moi les caméras disponibles",
                        "Quelles sont les caméras",
                        "Où sont les caméras",
                        "Montre moi la mosaique",
                        "Mosaique",
                        "Toutes les caméras",
                        "Je veux voir toutes les caméras"
                    ]
                },
                {
                    "name": "GetHelp",
                    "slots": [],
                    "samples": [
                        "guide d'utilisation",
                        "manuel d'utilisation",
                        "guide",
                        "comment je t'utilise",
                        "comment tu marches",
                        "comment ça marche",
                        "hein",
                        "Sos",
                        "je pige rien",
                        "Je comprend rien",
                        "J'ai besoin d'aide",
                        "aide moi",
                        "aide",
                        "Help"
                    ]
                },
                {
                    "name": "ChangeCamera",
                    "slots": [],
                    "samples": [
                        "Autre angle",
                        "Change de cam",
                        "Une autre caméra",
                        "Change la prise de vue",
                        "Change l'angle",
                        "Un autre angle",
                        "J'aime pas cet angle",
                        "Change d'angle de vue",
                        "Change d'angle ",
                        "Change de poit de vue",
                        "Change le point de vue",
                        "Change la vue",
                        "Change de camera"
                    ]
                },
                {
                    "name": "Zoom",
                    "slots": [],
                    "samples": [
                        "Zoom encore",
                        "Plus grand",
                        "Plus gros",
                        "Grossi la vidéo",
                        "Grossi l'image",
                        "Grossi",
                        "Agrandi la video",
                        "Agrandis l'image",
                        "Agrandis",
                        "Zoom l'image",
                        "Zoom sur l'image",
                        "Zoom sur la vidéo",
                        "Zoom"
                    ]
                },
                {
                    "name": "Dezoom",
                    "slots": [],
                    "samples": [
                        "plus grand",
                        "vue d'ensemble",
                        "Met un plan d'ensemble",
                        "moins grand",
                        "moins gros",
                        "dezoom",
                        "plan plus large",
                        "Plan large"
                    ]
                },
                {
                    "name": "GetScore",
                    "slots": [],
                    "samples": [
                        "c'est quoi le score",
                        "dis moi le score",
                        "tu connais le score",
                        "tu as le score",
                        "le score",
                        "je veux le score",
                        "donne le score",
                        "donne moi le score",
                        "score",
                        "le score",
                        "c'est quoi le score"
                    ]
                },
                {
                    "name": "AMAZON.MoreIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.NavigateSettingsIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.NextIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.PageUpIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.PageDownIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.PreviousIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.ScrollRightIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.ScrollDownIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.ScrollLeftIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.ScrollUpIntent",
                    "samples": []
                },
                {
                    "name": "LaunchRequest"
                }
            ],
            "types": [
                {
                    "name": "BEERS",
                    "values": [
                        {
                            "name": {
                                "value": "leffe"
                            }
                        },
                        {
                            "name": {
                                "value": "guiness"
                            }
                        },
                        {
                            "name": {
                                "value": "desperado"
                            }
                        },
                        {
                            "name": {
                                "value": "corona"
                            }
                        },
                        {
                            "name": {
                                "value": "stella"
                            }
                        },
                        {
                            "name": {
                                "value": "frontier"
                            }
                        }
                    ]
                }
            ]
        }
    }
};
