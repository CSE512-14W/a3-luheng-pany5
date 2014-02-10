
TAG_BLACKLIST = ["favorite", "favorites", "love", "awesome", "seen live", "cool", "favourite", 
                 "loved", "favorite songs", "amazing", "cover", "heard on pandora", "good",
                 "favourite songs", "favourites", "love it", "nice", "great",
                 "best", "live", "fucking awesome", "covers", "lovely", "good stuff",
                 "fav", "great song", "feel good", "perfect", "my favorite", "the best",
                 "<3", "other", "buy", "4", "great lyrics", "top", "badass", "test", "sex",
                 "favorite tracks", "77davez-all-tracks", "my favorites", "my favourites",
                 "all the best", "songs i absolutely love", "new", "love at first listen", 
                 "calm", "relax", "guilty pleasure", "guilty pleasures", "holiday", "top 40",
                 "sing along", "standards", "classic"]

# genres, even if they
TAG_WHITELIST = []
TAG_WHITELIST_FILE = "/Users/luheng/versioned/lastfm_vis/data/genre_whitelist.txt"

with open(TAG_WHITELIST_FILE, 'r') as whitelist_file:
    for line in whitelist_file:
        tag = line.strip().lower()
        TAG_WHITELIST.append(tag)
        if "-" in tag:
            TAG_WHITELIST.append(" ".join(tag.split("-")))

ARTIST_BLACKLIST = ["anal cunt"]

# filter out number only tags

if __name__ == "__main__":
    print "\n".join(TAG_WHITELIST)
    print "%d genres read" % len(TAG_WHITELIST)