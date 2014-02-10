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

See our story board at [here](storyboard.pdf?raw=true).

### Changes between Storyboard and the Final Implementation

We made two major changes between the storyboard and the final visualization. Firstly, we planned to incorporate track title information in the storyboard visualization. Because we couldn’t find the audio hyperlinks for the song tracks, we gave up our original design of displaying song titles and playing songs, along with network exploration. Secondly, we added on the feature of finding similar artists in the final visualization. Since the dataset includes similar tracks for each track, we also computed the relevance between artists and tags by normalized PMI (point-wise mutual information), which helped find some similar artists to the selected artist.

## Final Visualization


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

