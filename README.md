a3-luheng-pany5
===============

## Team Members

1. Luheng He luheng@uw.edu
2. Yi Pan pany5@uw.edu

## Project Name
"Explore Your Musicians!"
This interactive web application allows users to search, click and explore thousands of musicians and their related tags via a musician-tag relevance network. The visualization uses a large subset of the Million Song Last.fm dataset (http://labrosa.ee.columbia.edu/millionsong/), including 10,000 most popular artists and about 400 user-added tags.

## Running Instructions

Access our visualization at http://cse512-14w.github.io/a3-luheng-pany5/

## Storyboard

![alt tag](https://github.com/CSE512-14W/a3-luheng-pany5/raw/master/writeup/fig1.pdf)

![alt tag](https://github.com/CSE512-14W/a3-luheng-pany5/raw/master/writeup/fig2.pdf)

See our story board at [here](storyboard.pdf?raw=true).

In Figure 1, a dot means a song track and a circle means a tag name. A track with many tags will be listed in the middle and linked with each tag name through edges. We used various colors to differentiate top 10 most popular tag nodes for a specific artist. When users click a track, it will highlight its associated tags, display the track title and start to play the track. In the bottom, it shows the number of tracks listened to and the number of unique tag names tracked by last.fm users for this artist in search. 

In Figure 2, it shows some popular artists and similar tags for one or more selected tags. Here a dot means an artist and a circle means a tag name. When searching for some tags, artists connected with at least one selected tag will get highlighted. When mousing over an artist, it will display the number of tracks listened to and the number of unique tag names tracked by last.fm users for this artist. 

### Changes between Storyboard and the Final Implementation

We made two major changes between the storyboard and the final visualization. Firstly, we planned to incorporate track title information in the storyboard visualization. Because we couldn’t find the audio hyperlinks for the song tracks, we gave up our original design of displaying song titles and playing songs, along with network exploration. Secondly, we added on the feature of finding similar artists in the final visualization. Since the dataset includes similar tracks for each track, we also computed the relevance between artists and tags by normalized PMI (point-wise mutual information), which helped find some similar artists to the selected artist.

## Final Visualization

![alt tag](https://raw.github.com/CSE512-14W/a3-luheng-pany5/master/writeup/Screen%20Shot%202014-02-10%20at%201.41.53%20PM.png)
Move mouse over the icons on top of the page to see information about how to play with the visualization.

![alt tag](https://raw.github.com/CSE512-14W/a3-luheng-pany5/master/writeup/Screen%20Shot%202014-02-10%20at%201.22.30%20PM.png)
Type artist name in the search box or double-click on nodes to see related tags and similar artists on the network. Move mouse over nodes to highlight part of the graph.


## Development Process

We brainstormed potential topics and searched for datasets together. After we chose our dataset and discussed the initial visualization design and interactive technique, we split the work roughly as follows,
- Luheng He
  -	Data processing and preparation				        (3 hours) 	
  -	Design and Coding for Visualization			      (16 hours)
  -	Algorithm for Graph Construction				      (2 hours)
  -	Tech part of the write-up					            (3 hours)
- Yi Pan
  -	design storyboard sketches				            (2 hours)
  -	study data domain and data wrangling 		    	(3 hours)
  - draft the write-up                    				(4 hours)

Learning d3 and implementing the network visualization with event handlers took us most of time.

### Techniques
- Data Processing
  - Python, scipy and numpy
  - Data Wrangler
  - nPMI (Normalized Point-wise Mutual Information)
- Visualization
  - Javascript and jQuery
  - d3.js
  - Force-Directed Graph in d3.js
  - Search artist and tag name with auto-completion support (jQuery UI)
  - Interaction by dragging, double-clicking and hover
  - Graph Pruning by BFS (breadth-first search)

## Techinical Challenge

### Big Data

### Relevance-Popularity Trade-off of Artists

### Noisiness of User-add Tags


## References
- [1] The Million Song Dataset, T. Bertin-Mahieux, D. Ellis, B. Whitman and P. Lamere, ISMIR '11
- [2] The Million Song Dataset Challenge, B. McFee, T. Bertin-Mahieux, D. Ellis and G. Lanckriet, AdMIRe '12
- [3] Data-Driven Documents, http://d3js.org/, Mike Bostock

