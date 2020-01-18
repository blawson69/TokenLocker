/*
TokenLocker
locks the position and/or rotation of selected tokens.

On Github:	https://github.com/blawson69
Contact me: https://app.roll20.net/users/1781274/ben-l

Like this script? Become a patron:
    https://www.patreon.com/benscripts
*/

var TokenLocker = TokenLocker || (function () {
    'use strict';

    //---- INFO ----//

    var version = '1.2.1',
    debugMode = false,
    MARKERS,
    ALT_MARKERS = [{name:'red', tag: 'red', url:"#C91010"}, {name: 'blue', tag: 'blue', url: "#1076C9"}, {name: 'green', tag: 'green', url: "#2FC910"}, {name: 'brown', tag: 'brown', url: "#C97310"}, {name: 'purple', tag: 'purple', url: "#9510C9"}, {name: 'pink', tag: 'pink', url: "#EB75E1"}, {name: 'yellow', tag: 'yellow', url: "#E5EB75"}, {name: 'dead', tag: 'dead', url: "X"}],
    styles = {
        box:  'background-color: #fff; border: 1px solid #000; padding: 8px 10px; border-radius: 6px; margin-left: -40px; margin-right: 0px;',
        title: 'padding: 0 0 10px 0; color: ##591209; font-size: 1.5em; font-weight: bold; font-variant: small-caps; font-family: "Times New Roman",Times,serif;',
        button: 'background-color: #000; border-width: 0px; border-radius: 5px; padding: 5px 8px; color: #fff; text-align: center;',
        buttonWrapper: 'text-align: center; margin: 10px 0; clear: both;',
        textButton: 'background-color: transparent; border: none; padding: 0; color: #591209; text-decoration: underline;',
        code: 'font-family: "Courier New", Courier, monospace; background-color: #ddd; color: #000; padding: 2px 4px;',
    },

    checkInstall = function() {
        if (!_.has(state, 'TokenLocker')) state['TokenLocker'] = state['TokenLocker'] || {};
        if (typeof state['TokenLocker'].lockedTokens == 'undefined') state['TokenLocker'].lockedTokens = {};
        if (typeof state['TokenLocker'].showing == 'undefined') state['TokenLocker'].showing = false;
        if (typeof state['TokenLocker'].marker == 'undefined') state['TokenLocker'].marker = 'padlock';
        MARKERS = JSON.parse(Campaign().get("token_markers"));
        log('--> TokenLocker v' + version + ' <-- Initialized. You currently have ' + _.size(state['TokenLocker'].lockedTokens) + ' token(s) locked.');
        if (debugMode) {
			var d = new Date();
			showDialog('Debug Mode', 'TokenLocker v' + version + ' loaded at ' + d.toLocaleTimeString() + '<br><a style=\'' + styles.textButton + '\' href="!tl config">Show help</a>', 'GM');
		}
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
                    case 'markers':
						commandShowMarkers(msg);
						break;
                    case 'set-marker':
						commandSetMarker(msg, msg.content.split(/\s+/i).pop().toLowerCase());
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
            showDialog('Error', 'No tokens are selected!');
            return;
        }
		// Add/Remove token(s) from list of those to be locked
		var tokens = msg.selected.map(s => getObj(s._type, s._id));
        var lockedTokens = state['TokenLocker'].lockedTokens;

		tokens.forEach(token => {
            let token_id = token.get('id');
            if (action == 'unlock') {
                lockedTokens = _.omit(lockedTokens, token_id);
                token.set('status_' + state['TokenLocker'].marker, false);
            } else {
                lockedTokens[token_id] = {lockPosition: pos, lockRotation: rot};
                token.set('status_' + state['TokenLocker'].marker, state['TokenLocker'].showing);
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
        var marker_style = 'margin: 5px 10px 0 0; display: block; float: left;', message = '<h4>Commands</h4>';
        message += '<a style="' + styles.textButton + ' font-weight: bold;" href="!tl --lock">!tl --lock</a><br>Locks the position <i>and</i> rotation of the selected token(s). Attempts <b>by anyone</b> to move or rotate ';
        message += 'the token will result in a reset to the previous position/rotation.<br><br>';
        message += '<a style="' + styles.textButton + ' font-weight: bold;" href="!tl --lock pos rot">!tl --lock pos rot</a><br>Locks the position <i>and</i> rotation of the selected token(s) just like above. The "pos" and "rot" options can be in any order.<br><br>';
        message += '<a style="' + styles.textButton + ' font-weight: bold;" href="!tl --lock pos">!tl --lock pos</a><br>Locks <i>only</i> the position of the selected token(s). Rotation is still changable or will be unlocked.<br><br>';
        message += '<a style="' + styles.textButton + ' font-weight: bold;" href="!tl --lock rot">!tl --lock rot</a><br>Locks <i>only</i> the rotation of the selected token(s). Position is still changable or will be unlocked.<br><br>';
        message += '<a style="' + styles.textButton + ' font-weight: bold;" href="!tl --unlock">!tl --unlock</a><br>Unlocks both the position and rotation of the selected token(s).<br><br>';
        message += '<a style="' + styles.textButton + ' font-weight: bold;" href="!tl --show">!tl --show</a><br>Adds the Locked token marker to all locked tokens so they are easily recognizable. This <i>will</i> be visible to all players.<br><br>';
        message += '<a style="' + styles.textButton + ' font-weight: bold;" href="!tl --hide">!tl --hide</a><br>Removes the Locked token marker from all locked tokens but <i>does not</i> unlock them.';

        var curr_marker = _.find(MARKERS, function (x) { return x.tag == state['TokenLocker'].marker; });
        if (typeof curr_marker == 'undefined') curr_marker = _.find(ALT_MARKERS, function (x) { return x.tag == state['TokenLocker'].marker; });
        message += '<hr><h4>Locked Token Marker</h4>' + getMarker(curr_marker, marker_style);
        if (typeof curr_marker == 'undefined') message += '<b style="color: #c00;">Warning:</b> The token marker "' + state['TokenLocker'].marker + '" is invalid!';
        else message += 'This is the current Locked token marker. You may change it below.';
        message += '<div style="' + styles.buttonWrapper + '"><a style="' + styles.button + '" href="!tl markers" title="This may result in a very long list...">Choose Marker</a></div>';
        message += '<div style="text-align: center;"><a style="' + styles.textButton + '" href="!tl --set-marker &#63;&#123;Status Marker&#124;&#125;">Set manually</a></div>';

        showDialog('Help Menu', message);
    },

    commandShowHide = function(msg, action) {
        // Places an indicator on locked tokens for ease of finding them, or removes the indicator
        var lockedTokens = state['TokenLocker'].lockedTokens;
        var show = (action == 'show') ? true : false;
        state['TokenLocker'].showing = show;
        _.each(state['TokenLocker'].lockedTokens, function(obj, id) {
            var token = getObj('graphic', id);
            if (token) {
                token.set('status_' + state['TokenLocker'].marker, show);
            }
        });
    },

    commandSetMarker = function (msg, marker) {
        marker = marker.replace('=', '::');
        var status_markers = _.pluck(MARKERS, 'tag');
        _.each(_.pluck(ALT_MARKERS, 'tag'), function (x) { status_markers.push(x); });
        if (_.find(status_markers, function (tmp) {return tmp === marker; })) {
            state['TokenLocker'].marker = marker;
        } else {
            showDialog('Error', 'The token marker "' + marker + '" is invalid. Please try again.');
        }
        commandHelp(msg);
    },

    commandShowMarkers = function () {
        var message = '<table style="border: 0; width: 100%;" cellpadding="0" cellspacing="2">';
        _.each(ALT_MARKERS, function (marker) {
            message += '<tr><td>' + getMarker(marker, 'margin-right: 10px;') + '</td><td style="white-space: nowrap; width: 100%;">' + marker.name + '</td>';
            if (marker.tag == state['TokenLocker'].marker) {
                message += '<td style="text-align: center;">Current</td>';
            } else {
                message += '<td style="text-align: center; white-space: nowrap; padding: 2px;"><a style="' + styles.button + '" href="!tl set-marker ' + marker.tag + '">Set Marker</a></td>';
            }
            message += '</tr>';
        });

        _.each(MARKERS, function (icon) {
            message += '<tr><td>' + getMarker(icon, 'margin-right: 10px;') + '</td><td style="white-space: nowrap; width: 100%;">' + icon.name + '</td>';
            if (icon.tag == state['TokenLocker'].marker) {
                message += '<td style="text-align: center;">Current</td>';
            } else {
                message += '<td style="text-align: center; white-space: nowrap; padding: 2px;"><a style="' + styles.button + '" href="!tl set-marker ' + icon.tag.replace('::','=') + '">Set Marker</a></td>';
            }
            message += '</tr>';
        });

        message += '<tr><td colspan="3" style="text-align: center; padding: 7px;"><a style="' + styles.button + '" href="!tl --help">&#9668; Back</a></td></tr>';
        message += '</table>';
        showDialog('Choose Locked Marker', message);
    },

    getMarker = function (marker, style = '') {
        var marker_style = 'width: 24px; height: 24px;' + style;
        var return_marker = '<img src="" width="24" height="24" style="' + marker_style + ' border: 1px solid #ccc;" alt=" " />';
        if (typeof marker != 'undefined' && typeof marker.tag != 'undefined') {
            var status_markers = _.pluck(MARKERS, 'tag'),
            alt_marker = _.find(ALT_MARKERS, function (x) { return x.tag == marker.tag; });

            if (_.find(status_markers, function (x) { return x == marker.tag; })) {
                var icon = _.find(MARKERS, function (x) { return x.tag == marker.tag; });
                return_marker = '<img src="' + icon.url + '" width="24" height="24" style="' + marker_style + '" />';
            } else if (typeof alt_marker !== 'undefined') {
                if (alt_marker.url === 'X') {
                    marker_style += 'color: #C91010; font-size: 30px; line-height: 24px; font-weight: bold; text-align: center; padding-top: 0px; overflow: hidden;';
                    return_marker = '<div style="' + marker_style + '">X</div>';
                } else {
                    marker_style += 'background-color: ' + alt_marker.url + '; border: 1px solid #fff; border-radius: 50%;';
                    return_marker = '<div style="' + marker_style + '"></div>';
                }
            }
        }
        return return_marker;
    },

    showDialog = function (title, content) {
        // Constructs a dialog box for chat output
        title = (title == '') ? '' : '<div style=\'' + styles.title + '\'>' + title + '</div>';
        var body = '<div style=\'' + styles.box + '\'>' + title + '<div>' + content + '</div></div>';
        sendChat('TokenLocker','/w GM ' + body, null, {noarchive:true});
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
