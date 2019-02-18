/*
TokenLocker
locks the position and/or rotation of selected tokens.

On Github:	https://github.com/blawson69
Contact me: https://app.roll20.net/users/1781274/ben-l
Like this script? Buy me a coffee: https://venmo.com/theBenLawson
*/

var TokenLocker = TokenLocker || (function () {
    'use strict';

    //---- INFO ----//

    var version = '1.1',
    styles = {
        box:  'background-color: #fff; border: 1px solid #000; padding: 8px 10px; border-radius: 6px; margin-left: -40px; margin-right: 0px;',
        title: 'padding: 0 0 10px 0; color: ##591209; font-size: 1.5em; font-weight: bold; font-variant: small-caps; font-family: "Times New Roman",Times,serif;',
        button: 'background-color: #000; border-width: 0px; border-radius: 5px; padding: 5px 8px; color: #fff; text-align: center;',
        textButton: 'background-color: transparent; border: none; padding: 0; color: #591209; text-decoration: underline;',
        code: 'font-family: "Courier New", Courier, monospace; background-color: #ddd; color: #000; padding: 2px 4px;',
    },

    checkInstall = function() {
        if (!_.has(state, 'TokenLocker')) state['TokenLocker'] = state['TokenLocker'] || {};
        if (typeof state['TokenLocker'].lockedTokens == 'undefined') state['TokenLocker'].lockedTokens = {};
        log('--> TokenLocker v' + version + ' <-- Initialized. You currently have ' + _.size(state['TokenLocker'].lockedTokens) + ' token(s) locked.');
    },

    //----- INPUT HANDLER -----//

    handleInput = function(msg) {
        if (msg.type == 'api' && msg.content.startsWith('!tl')) {
			var parms = msg.content.split(/\s+/i), pos = false, rot = false;

            var p2 = (parms[2]) ? parms[2] : '', p3 = (parms[3]) ? parms[3] : '';
            if (p2 == 'pos' || p3 == 'pos') pos = true;
            if (p2 == 'rot' || p3 == 'rot') rot = true;
            if (p2 === '' && p3 === '') {
                 pos = true;
                 rot = true;
            }

			if (parms[1] && playerIsGM(msg.playerid)) {
                switch (parms[1]) {
					case '--lock':
						commandLock(msg, 'lock', pos, rot);
						break;
					case '--unlock':
						commandLock(msg, 'unlock', pos, rot);
						break;
                    case '--show':
						commandShowHide(msg, 'show');
						break;
                    case '--hide':
						commandShowHide(msg, 'hide');
						break;
                    case '--help':
                    default:
                        commandHelp(msg);
				}
			} else if (playerIsGM(msg.playerid)) {
                commandHelp(msg);
            }
		}
    },

    //---- PRIVATE FUNCTIONS ----//

    commandLock = function(msg, action, pos, rot) {
        if (!msg.selected || !msg.selected.length) {
            sendChat('TokenLocker', '/w GM No tokens are selected!', null, {noarchive:true});
            howDialog('Error', 'No tokens are selected!');
            return;
        }
		// Add/Remove token(s) from list of those to be locked
		var tokens = msg.selected.map(s => getObj(s._type, s._id));
        var lockedTokens = state['TokenLocker'].lockedTokens;

		tokens.forEach(token => {
            let token_id = token.get('id');
            if (action == 'unlock') {
                lockedTokens = _.omit(lockedTokens, token_id);
                token.set('status_padlock', false);
            } else {
                lockedTokens[token_id] = {lockPosition: pos, lockRotation: rot};
            }
		});

        state['TokenLocker'].lockedTokens = lockedTokens;

        // Provide feedback
        if (action == 'unlock') {
            showDialog('', 'Selected token(s) unlocked.');
        } else {
            let which = [];
            if (pos) which.push('Position');
            if (rot) which.push('Rotation');
            showDialog('', which.join(' and ') + ' locked for selected token(s).');
        }
	},

    commandHelp = function(msg) {
        var message = '<b>!tl --help</b><br>Sends this Help dialog to the chat window.<br><br>'
        + '<b>!tl --lock</b><br>Locks the position <i>and</i> rotation of the selected token(s). Attempts <b>by anyone</b> to move or rotate '
        + 'the token will result in a reset to the previous position/rotation.<br><br>'
        + '<b>!tl --lock pos rot</b><br>Locks the position <i>and</i> rotation of the selected token(s) just like above. The "pos" and "rot" options can be in any order.<br><br>'
        + '<b>!tl --lock pos</b><br>Locks <i>only</i> the position of the selected token(s). Rotation is still changable or will be unlocked.<br><br>'
        + '<b>!tl --lock rot</b><br>Locks <i>only</i> the rotation of the selected token(s). Position is still changable or will be unlocked.<br><br>'
        + '<b>!tl --unlock</b><br>Unlocks both the position and rotation of the selected token(s).<br><br>'
        + '<b>!tl --show</b><br>Adds the <i>padlock</i> status marker to all locked tokens so they are easily recognizable. This <i>will</i> be visible to all players.<br><br>'
        + '<b>!tl --hide</b><br>Removes the <i>padlock</i> status marker from all locked tokens.';
        showDialog('Help Menu', message);
    },

	showDialog = function (title, content) {
        // Constructs a dialog box for chat output
        title = (title == '') ? '' : '<div style=\'' + styles.title + '\'>' + title + '</div>';
        var body = '<div style=\'' + styles.box + '\'>' + title + '<div>' + content + '</div></div>';
        sendChat('TokenLocker','/w GM ' + body, null, {noarchive:true});
	},

    commandShowHide = function(msg, action) {
        // Places an indicator on locked tokens for ease of finding them, or removes the indicator
        var lockedTokens = state['TokenLocker'].lockedTokens;
        _.each(state['TokenLocker'].lockedTokens, function(obj, id) {
            var token = getObj('graphic', id);
            if (token) {
                var show = (action == 'show') ? true : false;
                token.set('status_padlock', show);
            }
        });
    },

    handleMove = function(obj, prev) {
        // Enforces locks on tokens
        var token_id = obj.get('id');
        var lockedTokens = state['TokenLocker'].lockedTokens;
        if (_.has(lockedTokens, token_id)) {
            if (lockedTokens[token_id].lockPosition) obj.set({left: prev.left, top: prev.top});
            if (lockedTokens[token_id].lockRotation) obj.set({rotation: prev.rotation});
        }
    },

    //---- PUBLIC FUNCTIONS ----//

    registerEventHandlers = function () {
		on('chat:message', handleInput);
        on('change:graphic', handleMove);
	};

    return {
		checkInstall: checkInstall,
		registerEventHandlers: registerEventHandlers
	};
}());

on("ready", function () {
    TokenLocker.checkInstall();
    TokenLocker.registerEventHandlers();
});
