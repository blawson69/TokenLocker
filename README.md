# TokenLocker

> **New in v1.1:** TokenLocker has been updated to support the new [custom token markers](https://wiki.roll20.net/Custom_Token_Markers).

This [Roll20](http://roll20.net/) script allows the GM to lock the position and/or the rotation of selected tokens.

A Locked token marker can be toggled on and off to show which tokens are locked ([see below](#--show)). This defaults to the *padlock* but may be changed to any token marker desired. The Help Menu provides a "Choose Marker" button to display all token markers *including custom token markers* for easy selection, or you can use the "set manually" link to provide the name or name::ID combo for any valid token markers.

Be careful of conflicts with other scripts, such as [EncumbranceTracker](https://github.com/blawson69/EncumbranceTracker), [ExhaustionTracker](https://github.com/blawson69/ExhaustionTracker), [CombatTracker](https://github.com/vicberg/Combattracker), and others that also modify token markers. If changing the Locked token marker, **make sure you choose a token marker that is not being used by another script.**

## Syntax

`!tl <command>`

## Commands:
* **--help**
* **--lock** <_pos_> <_rot_>
* **--unlock**
* **--show**
* **--hide**

---
### --help
Whispers a help dialog in the chat window with all the command options and a "Choose Marker" button to select a token marker other than the default.

```
!tl --help
```

---
### --lock
This command will lock the position and/or the rotation of all selected tokens. The "_pos_" and "_rot_" options stand for _position_ and _rotation_, and may be passed in any order. Leaving both of these options out is the same as including both. The following have the same effect of locking position and rotation:

```
!tl --lock
!tl --lock pos rot
!tl --lock rot pos
```

You may lock just the position or the rotation of a token, leaving the other unlocked. For instance, pass the "_pos_" alone to only allow rotation, or pass "_rot_" alone to only allow movement.

```
!tl --lock pos
!tl --lock rot
```

---
### --unlock
This command will unlock both the position and the rotation of all selected tokens.

```
!tl --unlock
```

---
### --show
When you have a number of tokens locked, you may forget which ones they are. For this reason, the  `--show` command will place a Locked token marker on every token that is currently locked in some way. This applies _across all pages_, so keep that in mind if you are in-game.

```
!tl --show
```

---
### --hide
This removes the Locked token marker from all locked tokens.
```
!tl --hide
```
