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
import path_config

def get_unique_tags(tag_file_path, tag_freq_cutoff = 10):
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

def process(output_file_path):
    """ walk through the raw data directory and output an integrated json file
    """
    tag_freq = get_unique_tags(path_config.TAGS_PATH); 
    
    file_list = []
    track_list = []
    """
    for (dirpath, dirnames, filenames) in os.walk(path_config.TRAIN_SET_PATH):
        for filename in filenames:
            file_list.append(os.path.join(dirpath, filename));
    """
    for (dirpath, dirnames, filenames) in os.walk(path_config.TEST_SET_PATH):
        for filename in filenames:
            file_list.append(os.path.join(dirpath, filename));
       
    print "Found %d track files." % len(file_list)
    
    file_counter = 0
    obj_counter = 0
    
    for filename in file_list:
        with open(filename, 'r') as input_file:
            file_counter += 1
            input_obj = json.load(input_file)
            del input_obj['similars']
            del input_obj['title']
            tag_list = input_obj['tags']
            input_obj['tags'] = get_trimmed_tag_list(tag_list, tag_freq)
            input_file.close()
            if len(input_obj['tags']) > 0:
                track_list.append(input_obj)
                obj_counter += 1
                if obj_counter % 1000 == 0:
                    print "processed %06d files, keeping %06d\r" % (file_counter, obj_counter)
    
    with open(output_file_path, "w") as output_file:            
        json.dump(track_list, output_file)
        output_file.close()
        
    print "Got %d tracks with non-empty tag list" % len(track_list)
    return None

if __name__ == '__main__':
    #if len(sys.argv) != 1:
    #    print 'usage: python [output_file_path]'
    #else:
        output_file_path = 'lastfm_test_tag_freq_10.json'
        process(output_file_path)
    
