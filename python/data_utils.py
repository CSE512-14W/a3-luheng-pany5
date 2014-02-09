'''
Created on Feb 3, 2014

@author: luheng
'''
from collections import Counter
import numpy
import scipy
import scipy.sparse

class label_dict:
    def __init__ (self):
        self.idx2str = []
        self.str2idx = {}
        self.counter = Counter() 
    
    def update(self, new_str, accept_new = True):
        if new_str in self.str2idx:
            idx = self.str2idx[new_str]
        elif accept_new:
            idx = len(self.idx2str)
            self.str2idx[new_str] = idx
            self.idx2str.append(new_str)
        else:
            return [-1, -1]    
        self.counter.update([idx,])
        return [idx, self.counter[idx]] 
    
    def update_all(self, str_list, accept_new = True):
        res = [self.update(s, accept_new) for s in str_list]
        return [[t[0] for t in res], [t[1] for t in res]]
    
    def size(self):
        return len(self.idx2str)
    
    def print_info(self):
        print "total size: ", len(self.idx2str)
        # print most common labels
        for t in self.counter.most_common(100):
            try:
                print self.idx2str[t[0]] , t[1]
            except UnicodeEncodeError:
                continue
        #print "\n".join([self.idx2str[t[0]-1] + " " + str(t[1]) for t in self.counter.most_common(100)])
        
class cooc_mat:
    def __init__ (self, nr, nc, data_type=int):
        self.mat = scipy.sparse.dok_matrix((nr, nc), dtype=data_type)
        self.num_rows = nr
        self.num_cols = nc
        
    def update(self, row_id, col_id, val=1):
        if row_id < 0 or row_id >= self.num_rows or col_id < 0 or col_id > self.num_cols:
            return -1
        
        new_val = self.mat[row_id, col_id] + val
        self.mat[row_id, col_id] = new_val
        return new_val
    
    def update_all(self, row_ids, col_ids, vals=[1,]):
        nrows = len(row_ids)
        ncols = len(col_ids)
        nvals = len(vals)
        if ncols == 1:
            if nvals == 1:
                return [self.update(row_ids[i], col_ids[0], vals[0]) for i in range(nrows)]
            else:
                return [self.update(row_ids[i], col_ids[0], vals[i]) for i in range(nrows)]
        elif nrows == 1:
            if nvals == 1:
                return [self.update(row_ids[0], col_ids[i], vals[0]) for i in range(ncols)]
            else:
                return [self.update(row_ids[0], col_ids[i], vals[i]) for i in range(ncols)]
        else:
            if nvals == 1:
                return [self.update(row_ids[i], col_ids[i], vals[0]) for i in range(ncols)]
            else:
                return [self.update(row_ids[i], col_ids[i], vals[i]) for i in range(ncols)]
        
    def print_info(self):
        print self.mat
        
def test():
    mydict = label_dict()
    print mydict.update("Epica")
    print mydict.update("Nightwish")
    print mydict.update("Nightwish")
    print mydict.update("Lacrimosa")
    print mydict.update("Britney Spears", False)
    print mydict.update_all(["Epica", "Iron Maiden", "Nightwish", "Therion", ])
    print mydict.print_info()
    
def test_mat():
    mymat = cooc_mat(10, 10)
    print mymat.update(5,5,1)
    print mymat.update(6,6,2)
    print mymat.update(5,5)
    print mymat.update(7,7)
    mymat.print_info()
    
if __name__ == '__main__':
    test()
    test_mat()