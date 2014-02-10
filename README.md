a3-luheng-pany5
===============

## Team Members

1. Luheng He luheng@uw.edu
2. Yi Pan pany5@uw.edu

## Project Name

This interactive web application allows users to explore the relationship between music tags and artists from Million Song Last.fm dataset.

## Running Instructions

Access our visualization at http://cse512-14w.github.io/a3-luheng-pany5/

## Story Board

See our story board at [link to your storyboard pdf file](storyboard.pdf?raw=true) here.

### Changes between Storyboard and the Final Implementation

We made two major changes between the storyboard and the final visualization. Firstly, we planned to incorporate track title information in the storyboard visualization. Because we couldn’t find the audio hyperlinks for the song tracks, we gave up our original design of displaying song titles and playing songs, along with network exploration. Secondly, we added on the feature of finding similar artists in the final visualization. Since the dataset includes similar tracks for each track, we also computed the relevance between artists and tags by normalized PMI (point-wise mutual information), which helped find some similar artists to the selected artist.


## Development Process
We brainstormed for potential topics and looked for datasets together. After we chose our dataset and discussed the initial visualization design and interaction technique, we split the work roughly as follows,
Luheng He
-	Data processing and preparation				        (3 hours) 	
-	Design and Coding for Visualization			      (16 hours)
-	Algorithm for Graph Construction				      (2 hours)
-	Tech part of the write-up					            (3 hours)
Yi Pan
-	design storyboard sketches				            (2 hours)
-	study data domain and data wrangling 		    	(3 hours)
- draft the write-up                    				(4 hours)

Learning d3 and implementing the Force-Directed Graph with event handlers took the most of time. 
