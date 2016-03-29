Rules for editing

1. Test your changes
2. Make sure to follow the rules designated by MichealLeeHobbs here

Rules for pull requests

1. Test your changes
2. Listen well to hound bot
3. Provide a description of what it does
4. Make sure to follow the rules designated by MichealLeeHobbs here

------------------------------------------------
This weekend I spent hours dealing with the results of poor coding practices. Nearly all of these appear to have come from the original Ogar project. However many of them have been copied in new work. We need to setup a Contributing and Style guide. This is a place where we could use some help as I do not have the time to build one at this time. As a minimal it should include the following:

1a) How to setup you dev enviroment: Node, Git, and your IDE. For IDE I suggest we include guides for Atom, Sublime, Visual Studio Code. I'll add a section later for WebStorm. Most wont have this as it is $200 a year.
1b) Setting up the project, i.e. npm install.
2) Setup IDE to use .editorconfig  reference: http://editorconfig.org/#overview
3) Setup IDE to use JSHint. reference: http://jshint.com/about/
4) Style and Coding practices. Mostly you'll be ok as long as you follow 2 and 3, but there are some things that need to be covered. Class names should use pascal case to include the file name. Member variables should use camel case. Do not directly access member variables in another class, explained below.

    'use strict';
    class GameServer {
      constructor() {
        let this.nodes = [];
      }
      getNodes() { return this.nodes; }
      addNode(node) { this.nodes.push(node); }
      removeNode(node) { /* code to remove a node */ }
    }

    class PlayerTracker {
      constructor(gameServer) {
        this.gameServer = gameServer;
      }
      update() {
        let newNode = {/* stuff */}; /* some new node
    
        this.gameServer.push(newNode); // This is wrong! It breaks encapsulation!!! VERY BAD!!!

        this.gameServer.addNode(newNode); // This is correct! Coder tested, mother approved!
      }
    }

5) A short guild on ES6, 'use strict'; let and const vs var (don't use var), and arrow function.

[1, 2, 3].forEach(function(num){ console.log(num); );

is the same as the arrow function version:

[1, 2, 3].forEach((num)=>{ console.log(num); });

There's more to arrow function than that, but that is all most people need to know.

6) How to do a pull request and how to check that it passes travis-ci and hound-ci.

I'm sure there's more but that is all I can think of for right now. Also, we should do this as a mark down md file. That was they can just click on it on github and it will be all nicely formatted for them.

I am putting in 20ish hours a week on this project. I want to make it great. I want it to be polished!

------------------------------------------------
