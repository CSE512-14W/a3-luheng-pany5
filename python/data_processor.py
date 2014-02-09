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
from math import log
import numpy
import os
import sys

from data_utils import *
from data_config import *
import path_config

def get_unique_tags(tag_file_path, tag_freq_cutoff = 3000):
    """ read tag list and their frequency
    """
    tag_freq = {}
    with open(tag_file_path, 'r') as input_file:
        for line in input_file:
            info = line.strip().split()
            if len(info) > 5:
                continue
            tag = " ".join([t.strip().lower() for t in info[:len(info)-1]])
            freq = int(info[len(info)-1])
            if tag in TAG_WHITELIST or \
             (freq >= tag_freq_cutoff and not tag in TAG_BLACKLIST):    
                tag_freq[tag] = freq
        input_file.close()
        
    print "Read %d tags with frequency >= %d" % (len(tag_freq), tag_freq_cutoff)
    return tag_freq

def get_trimmed_tag_list(tag_list, tag_freq):
    return [t[0].lower() for t in tag_list if t[0].lower() in tag_freq]

def get_vector(mat, vec_id):
    idx0,idx1 = mat.indptr[vec_id], mat.indptr[vec_id+1]
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

def process(output_file_path, max_num_artists = 500):
    """ walk through the raw data directory and output an integrated json file
    """
    tag_freq = get_unique_tags(path_config.TAGS_PATH); 
    for t in tag_freq.keys():
        print t, tag_freq[t]
  
    artists = label_dict()
    tags = label_dict()
    
    file_counter = 0
    obj_counter = 0
    artist_tag = cooc_mat(100000, len(tag_freq) + 10)

    #for root_dir in [path_config.TRAIN_SET_PATH, path_config.TEST_SET_PATH]:
    for root_dir in [path_config.TEST_SET_PATH]:
        print "reading data from: ", root_dir
        for (dirpath, dirnames, filenames) in os.walk(root_dir):
            for filename in filenames:
                with open(os.path.join(dirpath, filename), 'r') as input_file:
                    file_counter += 1
                    input_obj = json.load(input_file)
                    input_file.close()
                    
                    if input_obj["artist"].lower() in ARTIST_BLACKLIST:
                        continue
                    
                    tag_list = input_obj['tags']
                    new_tag_list = get_trimmed_tag_list(tag_list, tag_freq)
                    
                    if len(new_tag_list) > 0:
                        [artist_id, _] = artists.update(input_obj["artist"])
                        for tag in new_tag_list:
                            [tag_id, _] = tags.update(tag)
                            artist_tag.update(artist_id, tag_id)
                    
                        obj_counter += 1
                        if obj_counter % 10000 == 0:
                            print "processed %06d files, keeping %06d tracks, %06d artists\r" % (file_counter, obj_counter, artists.size())
 
    artist_ids = [t[0] for t in artists.counter.most_common(max_num_artists)]
    remap_artists = {}
    remap_tags = {}
    labels = []
    links = []
    label_map = []
    label_freq = []
    
    for artist_id in artist_ids:
        remap_artists[artist_id] = len(labels)
        labels.append(artists.idx2str[artist_id])
    
    tag_id_start = len(labels)

    for tag_id in range(tags.size()):
        remap_tags[tag_id] = len(labels)
        labels.append(tags.idx2str[tag_id])
    label_freq = [0 for l in labels]
    
    min_weight = 1e8
    max_weight = -1
    avg_weight = 0
    num_edges = 0
    total_freq = 0
    
    artist_tag_mat = artist_tag.mat.tocsr()
    for artist_id in artist_ids:
        [ids, weights] = get_vector(artist_tag_mat, artist_id)
        num_tags = len(ids)
        assert num_tags > 0
        new_artist_id = remap_artists[artist_id]
        new_tag_ids = [remap_tags[tag_id] for tag_id in ids]
        new_weights = [w for w in weights]
        num_edges += num_tags
        total_freq += sum(weights)
        label_freq[new_artist_id] = sum(weights)
        
        links.append({ "n":new_tag_ids, "w":new_weights })
    
    #print "min weight: ", min_weight, "max weight: ", max_weight, "avg weight: ", avg_weight / num_edges
    
    artist_tag_mat = artist_tag.mat.tocsc()
    for tag_id in range(tags.size()):
        [ids, weights] = get_vector(artist_tag_mat, tag_id)
        num_artists = len(ids)
        new_tag_id = remap_tags[tag_id]
        filter = [i for i in range(num_artists) if ids[i] in remap_artists]
        new_artist_ids = [remap_artists[ids[i]] for i in filter]
        new_weights = [weights[i] for i in filter]
        label_freq[new_tag_id] = sum(new_weights)
        
        links.append({ "n":new_artist_ids, "w":new_weights })

    print len(labels), len(links)
    
    # normalize weights, compute PMI
    log_total_freq = log(total_freq)
    for id in range(len(links)):
        neighbors = links[id]["n"]
        weights = links[id]["w"]
        if len(neighbors) == 0:
            continue
        
        log_freq = log(label_freq[id])
        # normalized PMI
        new_weights = [(log(weights[i]) + log_total_freq \
                       - log_freq - log(label_freq[neighbors[i]])) / \
                       (- log(weights[i]) + log_total_freq) \
                       for i in range(len(neighbors))]
        # sort by weight in descending order
        indices = numpy.argsort(new_weights)[::-1]
        links[id]["n"] = [neighbors[i] for i in indices]
        links[id]["w"] = [new_weights[i] for i in indices]
        # sanity check by eyes 0_o
        if id < tag_id_start and label_freq[id] > 100:
            try:
                print labels[id], len(neighbors)
                for (i, j) in enumerate(links[id]["n"]): 
                    print links[id]["w"][i], label_freq[j], labels[j]
                print "\n"
            except UnicodeEncodeError:
                continue
        
    graph = {}
    graph["labels"] = labels
    graph["links"] = links
    graph["tag_id_start"] = tag_id_start
    graph["frequency"] = label_freq
    
    with open(output_file_path, "w") as output_file:            
        json.dump(graph, output_file)
        output_file.close()
        
    print "Got %d tracks with non-empty tag list" % obj_counter
    
    #print "top artists"
    #artists.print_info()
    #print "top tags"
    #tags.print_info()
    
    return None

if __name__ == '__main__':
    output_file_path = path_config.CLEANED_DATA_PATH + '/lastfm_500artist_adj_graph.json'
    process(output_file_path, 500)
    
