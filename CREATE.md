# Prompt Overview
Create an app that will run a mini-pickleball tournament named "King of the Court | 20 Players", a modified King of the Court format using the information detailed below.
# Setup
The app will need to track 20 players who are randomly paired at the beginning for Game 1. There will be 5 courts designated as Court 1 (KOTC Top), Court 2 (Pool A Top), Court 3 (Pool A Bottom), Court 4 (Pool B Top), Court 5 (Pool B Bottom) that will require tracking of each games results throughout the session.
# Input
A list of 20 player names can be provided in a list or CSV. Randomly pair players and designate each pair; (example, Pair 1, Pair 2, Pair 3... stopping with Pair 10). 

Each game will be broken up as follows:
- **Court 1 (KOTC Top)** where Pair 1 will play Pair 2
- **Pool A**
	- **Court 2 (Pool A Top)** where Pair 3 plays Pair 4
	- **Court 3 (Pool A Bottom)** where Pair 5 plays Pair 6
- **Pool B**
	- **Court 4 (Pool B Top)** where Pair 7 plays Pair 8
	- **Court 5 (Pool B Bottom)** where Pair 9 plays Pair 10
# Game Play
- Games are 13 minute timed games after which scoring switches to Rally Score format
- If all Games are completed except one, then that game must proceed to Rally Score format regardless of the time
- Games are played to 11 points, must win by 2 points; unless in Rally Score format, then winner decided by first team to 11

## KOTC Format
### Winning Pairs/Teams
- Any Pair that wins proceeds up the ladder to the next court; for example, Pair 8 won on Court 4 (Pool B Bottom) will be promoted to play the next game on Court 3.
- The winning Pair on Court 1 (KOTC Top) remains as Pair 1
- The winning Pair on Court 2 (Pool A Top) is renamed as Pair 2 and moved up to play on Court 1 KOTC Top) for the next game
- The winning Pair on Court 3 (Pool A Bottom) is renamed as Pair 3 and moved up to play on Court 2 (Pool A Top) for the next game
- The winning Pair on Court 4 (Pool B Top) is renamed as Pair 5 and moved up to play on Court 3 (Pool A Bottom) for the next game
- The winning Pair on Court 5 (Pool B Bottom) is renamed as Pair 7 and moved up to play on Court 4 (Pool B Top) for the next game
### Losing Pairs/Teams
- Any Pair that loses is moved into the correct loser group
	- Losing players are reassigned into a Pool using the following rules:
		- Losing Pair on Court 1 and Court 2 are placed into Pool A Losers group
		- Losing Pair on Court 3 and Court 4 are placed into Pool B Losers group
		- Losing Pair on Court 5 are placed into Pool B Losers group
### Reassigning Pairs in Losing Pools
- The 4 losing players in Pool A Losers group are randomly assigned; however, they should not be playing with the same partner that they lost the previous game with
	- Random pairs will be positioned as Pair 4 and Pair 6
- The 6 losing players in Pool B Losers group are randomly assigned; however, they should not be playing with the same partner that they lost the previous game with

## App UI
The app should have a title displaying **CCPC | King of the Court (20 Players) - Jan 3rd, 2026** (insert the current date). Near the top it should also display the current game number (#) being played.

### Setup Page
- At the beginning of the KOTC session, all 20 player names will need to be input. A large textbox that accepts names in a list or a CSV should be used with a button labeled **Start Game 1** to initiate the game session and then the app displays the Game Results page

### Games Results Page
- After following the rules to randomly assign all 20 players to 10 Pairs/Teams, display all court information and Pairs/Teams playing on each, placing a radio button in front of each team to indicate who won the game
- Once all radio buttons for the 5 games are selected and the button to **Submit** has been selected, enable the button **Confirm Results**. The button labeled **Clear Results** will unselect all the radio buttons. The **Confirm Results** will commit the game winner results and proceed to the next game
- After Game 4 results have been submitted include a new button labeled **End Games** (while still keeping all the other buttons). The new **End Games** button will stop any further submitting of game results or proceeding to a new games page.

### Games Statistics Page
- Once the **End Games** button has been submitted, display a different page which summarizes statistics for all players
- Display results showing Player Name, Wins, Loses, KOTC Wins, Win % - sorting from highest Win % to Lowest Win %
	- The column for KOTC Wins should display the number of Wins on Court 1
- Under the results table display a full results recap of each game played with the results on each court showing winners vs losers

