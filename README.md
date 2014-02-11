a3-luheng-pany5
===============

## Team Members

1. Luheng He luheng@uw.edu
2. Yi Pan pany5@uw.edu

## Explore Your Musicians!
This interactive web application allows users to search, click and explore thousands of musicians and their related tags via a musician-tag relevance network. The visualization uses a large subset of the Million Song Last.fm dataset (http://labrosa.ee.columbia.edu/millionsong/), including 10,000 most popular artists and about 400 user-added tags. 
 
![alt tag](https://raw.github.com/CSE512-14W/a3-luheng-pany5/master/writeup/preview.png)

Artists are connected to a tag if they have a song on Last.fm that is labeled with that tag. Edges have different width, representing how strong the correlation is. The network is pruned based on both relevance and popularity of the artist/tag, showing the information that users care about the most.

## Running Instructions

Access our visualization at http://cse512-14w.github.io/a3-luheng-pany5/

## Storyboard

We are inspired by Google’s Music Timeline from Google Play Music, available at http://research.google.com/bigpicture/music/#.

The Music Timeline “shows genres of music waxing and waning” from 1950 to 2010. The visualization focuses on different music genres and shows each genre’s popularity over the past half a century. However, it tells little about users’ experiences and feedbacks for listening to different types of music. This idea inspired us to design a dynamic music network, where people can freely explore the interaction between artists and user-added tags. Our original goal of the web visualization was to enable users to search for an artist’s most popular tags and similar artists.  Meanwhile, users can search for some most popular artists meeting the criteria of a specific tag or a combination of tags, such as music genre, emotion, and nationality. 

Below are our storyboard sketches. 


![alt tag](https://github.com/CSE512-14W/a3-luheng-pany5/raw/master/writeup/fig1.png)


In Figure 1, it shows some user-added tags for a searched artist. Here a dot means a song track and a circle means a tag name. A track with many tags will be listed in the middle and linked with each tag name through edges. We used various colors to differentiate top 10 most popular tag nodes for a specific artist. When users click a track, it will highlight its associated tags, display the track title and start to play the track. In the bottom, it shows the number of tracks listened to and the number of unique tag names tracked by last.fm users for this artist in search. 


![alt tag](https://github.com/CSE512-14W/a3-luheng-pany5/raw/master/writeup/fig2.png)


In Figure 2, it shows some popular artists and similar tags for one or more selected tags. Here a dot means an artist and a circle means a tag name. When searching for some tags, artists connected with at least one selected tag will get highlighted. When mousing over an artist, it will display the number of tracks listened to and the number of unique tag names tracked by last.fm users for this artist. 

Initially, we planned to incorporate track title information in the visualization. Because we couldn’t find the audio hyperlinks for song tracks, we dropped our original design of displaying song titles and playing songs, along with network exploration. Instead, we focused on designing a web visualization that enabled users to fully explore the interaction between artists and their tags. Through search, click, or move mouse over, users can rearrange the complete musician-tag network and zoom to a subgraph with their interest. 

In order to help users play with our web visualization, we placed two instruction icons on top of the musician-tag network. The question icon shows how to play with the visualization and achieve the best visual effect. The information icon shows the dataset source. 


### Changes between Storyboard and the Final Implementation

We made one major change between the storyboard and the final visualization.  We dropped the original design of displaying song titles, showing song and tag aggregate information, and playing songs, because of lacking the audio hyperlinks for song tracks. Instead, we combined two storyboard sketches into one dynamic musician-tag network, where musicians and their tags are connected. Two icons are offered on the web application to aid users to better play with our visualizaiton. 


## Final Visualization


Move mouse over the icons on top of the page to see information about how to play with the visualization.

![alt tag](https://raw.github.com/CSE512-14W/a3-luheng-pany5/master/writeup/Screen%20Shot%202014-02-10%20at%201.41.53%20PM.png)

Type artist name in the search box or double-click on nodes to see most relevant tags and similar artists on the network. Move mouse over nodes to highlight part of the graph.

![alt tag](https://raw.github.com/CSE512-14W/a3-luheng-pany5/master/writeup/Screen%20Shot%202014-02-10%20at%201.22.30%20PM.png)

Double-click on the "trance" node to see a new network showing the most relevant bands and tags/subgenres ... and keep exploring!

![alt tag](https://raw.github.com/CSE512-14W/a3-luheng-pany5/master/writeup/trance.png)


## Development Process

We brainstormed potential topics and searched for datasets together. After we chose our dataset and discussed the initial visualization design and interactive technique, we split the work roughly as follows,
- Luheng He
  -	Data processing and preparation				        (3 hours) 	
  -	Design and Coding for Visualization			      (16 hours)
  -	Algorithm for Graph Construction				      (2 hours)
  -	Tech part of the write-up					            (3 hours)
- Yi Pan
  -	Design storyboard sketches				            (2 hours)
  -	Study data domain and data wrangling 		    	(3 hours)
  - Draft the write-up                    				(4 hours)

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
The Last.fm Million Song dataset (http://labrosa.ee.columbia.edu/millionsong/lastfm) contains 943,347 tracks, 522,366 unique user-add tags and more than 44,745 unique artists [1]. Each data entry contains a song, with information about its title, artist, user-add tags and a set of similar tracks. This dataset is significantly larger than any datasets we used for past assignments (i.e., the IMDB movie datasets with 3000 movies). To visualize this dataset, we need to make the correct design choices on the following aspects:
- Choosing a reasonable level of abstraction
- Selecting a subset of the data that people care about.

Therefore, we changed the dataset from track-level to artist-level. Instead of computing co-occurrence between tags and songs, we compute the co-occurrence between artists and tags instead. For example, if "Coldplay" has lots of songs tagged as "britpop" or "soft rock", then we consider "Coldplay" can be labeled as a "britpop"/"soft rock" artist. 

Moreover, we filtered artists with very small amount of tags and tags that are rarely used. This results in a reasonable -sized dataset for our final visualization. Our final dataset still contains 10,000 most popular artists and more than 400 tags, which is a lot to explore!

### Noisiness of User-add Tags
The tags from the Last.fm dataset are added by listeners, which are noisy and heterogeneous by nature. While some tags are about music genres, as we expected, there are other tags about geographic information or simply meaningless, for example: top 40, love at first listen, my favorites. These meaningless tags can hurt the quality of our artist-tag network a lot. For example, a meaningless tag such as "favorite" can lead from Justin Bieber to Marilyn Manson.

We deal with this problem by using blacklisting and whitelisting. We created a blacklist for meaningless tags as mentioned above. On the other hand, we created a whitelist for tags including all the music genres fetched from other data sources to improve tag quality in general. Tags in the whitelist are included in the final dataset regardless of their frequency.

### Relevance-Popularity Trade-off of Artists
With simple counting on the raw data, we can get co-occurrence information about how many times a musician get labeled with a certain tag. We use nPMI (normalized point-wise mutual information, http://en.wikipedia.org/wiki/Pointwise_mutual_information) to get a more accurate measurement about the relevance between an artist and a tag. However, if we use nPMI as the only criteria of showing similar artists/tags, then lots of low-popularity artists will show-up. On the other hand, if we only rank artists by their popularity, then we will see Britney Spears in every sub-network!

To solve this problem, for each tag, we rank artists by their relevance and popularity seperately, getting two different rankings. Then we sort the artists based on their position in these two different rankings. From the final visualization, we found this a very good trade-off method between artist relevance and popularity.


## References
- [1] The Million Song Dataset, T. Bertin-Mahieux, D. Ellis, B. Whitman and P. Lamere, ISMIR '11
- [2] The Million Song Dataset Challenge, B. McFee, T. Bertin-Mahieux, D. Ellis and G. Lanckriet, AdMIRe '12
- [3] Data-Driven Documents, http://d3js.org/, Mike Bostock

