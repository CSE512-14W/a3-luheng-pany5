#########################
# walk through the directory of raw data, extract useful fields
# for data size concern, 
# remove titles, similar tracks and low-frequency tags
# author: luheng
#########################

#########################
# stats with tag cut-off:
# Read 125696 tags with frequency >= 5
# Found 943334 track files.
import json
import os
import sys

from data_utils import *
import path_config

def get_unique_tags(tag_file_path, tag_freq_cutoff = 5000):
    """ read tag list and their frequency
    """
    tag_freq = {}
    with open(tag_file_path, 'r') as input_file:
        for line in input_file:
            info = line.strip().split()
            freq = int(info[len(info)-1])
            if freq >= tag_freq_cutoff:
                tag = " ".join([t.strip().lower() for t in info[:len(info)-1]])
                tag_freq[tag] = freq
        input_file.close()
        
    print "Read %d tags with frequency >= %d" % (len(tag_freq), tag_freq_cutoff)
    return tag_freq

def get_trimmed_tag_list(tag_list, tag_freq):
    return [t[0].lower() for t in tag_list if t[0].lower() in tag_freq]


def get_row(mat, row_id):
    idx0,idx1 = mat.indptr[row_id], mat.indptr[row_id+1]
    return [mat.indices[idx0:idx1], mat.data[idx0:idx1]]

def print_artists(artist_ids, artists, tags, artist_tag):
    for artist_id in artist_ids:
        try:
            print artists.idx2str[artist_id],
            [indices, vals] = get_row(artist_tag, artist_id)
            print ",".join([tags.idx2str[indices[i]] + ":" + str(vals[i]) for i in range(len(indices))])
            #for i in range(len(indices)):
            #    print tags.idx2str[indices[i]] + ":" + str(vals[i])
        except UnicodeEncodeError:
            continue
        except IndexError:
            continue
    
        
    
def process(output_file_path):
    """ walk through the raw data directory and output an integrated json file
    """
    tag_freq = get_unique_tags(path_config.TAGS_PATH); 
    for t in tag_freq.keys():
        print t, tag_freq[t]
  
    artists = label_dict()
    tags = label_dict()
    
    file_counter = 0
    obj_counter = 0
    artist_tag = cooc_mat(100000, 200)

    #for root_dir in [path_config.TRAIN_SET_PATH, path_config.TEST_SET_PATH]:
    for root_dir in [path_config.TEST_SET_PATH]:
        print "reading data from: ", root_dir
        for (dirpath, dirnames, filenames) in os.walk(root_dir):
            for filename in filenames:
                with open(os.path.join(dirpath, filename), 'r') as input_file:
                    file_counter += 1
                    input_obj = json.load(input_file)
                    input_file.close()
                    tag_list = input_obj['tags']
                    new_tag_list = get_trimmed_tag_list(tag_list, tag_freq)
                    if len(input_obj['tags']) > 0:
                        [artist_id, _] = artists.update(input_obj["artist"])
                        for tag in new_tag_list:
                            [tag_id, _] = tags.update(tag)
                            artist_tag.update(artist_id, tag_id)
                    
                        obj_counter += 1
                        if obj_counter % 1000 == 0:
                            print "processed %06d files, keeping %06d tracks, %06d artists\r" % (file_counter, obj_counter, artists.size())
 
    artist_ids = [t[0] for t in artists.counter.most_common(500)]
    artist_tag_mat = artist_tag.mat.tocsr()
    remap_artists = {}
    remap_tags = {}
    
    labels = []
    links = []
    label_map = []
    
    for artist_id in artist_ids:
        remap_artists[artist_id] = len(labels)
        labels.append(artists.idx2str[artist_id])
    
    tag_id_start = len(labels)
    for artist_id in artist_ids:
        [tag_ids, weights] = get_row(artist_tag_mat, artist_id)
        artist_freq = artists.counter[artist_id]
        tag_freq = tags.counter[tag_id]
        
        #weights_norm = sum(weights)
        new_artist_id = remap_artists[artist_id]
        new_tag_ids = []
        new_weights = []
        for i in range(len(tag_ids)):
            tag_id = tag_ids[i]
            if not tag_id in remap_tags:
                new_tag_id = len(labels)
                remap_tags[tag_id] = new_tag_id
                labels.append(tags.idx2str[tag_id])
            else:
                new_tag_id = remap_tags[tag_id]
            tag_ids[i] = new_tag_id
            weights[i] = 1.0 * weights[i] / artist_freq / tag_freq
            
        links.append({"artist":new_artist_id, "tags":tag_ids, "weights":weights})
            
    graph = {}
    graph["labels"] = labels
    graph["links"] = links
    graph["tag_id_start"] = tag_id_start
            
    with open(output_file_path, "w") as output_file:            
        json.dump(graph, output_file)
        output_file.close()
        
    print "Got %d tracks with non-empty tag list" % obj_counter
    
    print "top artists"
    artists.print_info()
    
    print "top tags"
    tags.print_info()
    artist_tag = artist_tag.mat.tocsr()

    return None

if __name__ == '__main__':
    output_file_path = path_config.CLEANED_DATA_PATH + '/lastfm_500artist_adj_graph.json'
    process(output_file_path)
    
