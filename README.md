# TokenLocker

This [Roll20](http://roll20.net/) script allows the GM to lock the position and/or the rotation of selected tokens.

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
Whispers a help dialog in the chat window with all the command options.

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
When you have a number of tokens locked, you may forget which ones they are. For this reason, the  `--show` command will place a _padlock_ status marker on every token that is currently locked in some way.

```
!tl --show
```

---
### --hide
This removes the  _padlock_ status marker from all locked tokens.
```
!tl --hide
```
