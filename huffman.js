import { BinaryHeap } from './heap.js';

export { HuffmanCoder }

class HuffmanCoder{

    // 0(Left) + 1(Right)
    // \' a
    // recursive function with base case
    stringify(node){
        if(typeof(node[1])==="string"){
            return '\''+node[1];
        }

        return '0' + this.stringify(node[1][0]) + '1' + this.stringify(node[1][1]);
    }
    // 2 <= 1 => 3
    // left child of 1 is 2
    // right child of 1 is 3

    // for compression => modify is false
    // for decompression => modify is true
    // convert node -> ['0,node']
    display(node, modify, index=1){
        if(modify){
            node = ['',node];
            if(node[1].length===1)
                node[1] = node[1][0];
        }

        if(typeof(node[1])==="string"){
            return String(index) + " = " + node[1];
        }

        let left = this.display(node[1][0], modify, index*2);
        let right = this.display(node[1][1], modify, index*2+1);
        let res = String(index*2)+" <= "+index+" => "+String(index*2+1);
        return res + '\n' + left + '\n' + right;
    }

    // huggman tree from code -> hufffman tree actual
    destringify(data){
        let node = [];
        // leaf node
        // here we have the importance of '
        if(data[this.ind]==='\''){
            this.ind++;
            node.push(data[this.ind]);
            this.ind++;
            return node;
        }

        // internal node
        // 0('a) 1(0'b1'c)
        this.ind++;
        let left = this.destringify(data);
        node.push(left);
        this.ind++;
        let right = this.destringify(data);
        node.push(right);

        return node;
    }

    // it is basically a dfs
    getMappings(node, path){
        // leaf
        if(typeof(node[1])==="string"){
            this.mappings[node[1]] = path;
            return;
        }

        // except leaf
        this.getMappings(node[1][0], path+"0");
        this.getMappings(node[1][1], path+"1");
    }

    encode(data){

        this.heap = new BinaryHeap();

        // store frequency count
        const mp = new Map();
        for(let i=0;i<data.length;i++){
            if(data[i] in mp){
                mp[data[i]] = mp[data[i]] + 1;
            } else{
                mp[data[i]] = 1;
            }
        }

        for(const key in mp){
            this.heap.insert([-mp[key], key]);
        }

        // creating huffman tree
        while(this.heap.size() > 1){
            const node1 = this.heap.extractMax();
            const node2 = this.heap.extractMax();

            const node = [node1[0]+node2[0],[node1,node2]];
            this.heap.insert(node);
        }
        const huffman_encoder = this.heap.extractMax();

        // a -> 0
        // b -> 01
        // c -> 11
        this.mappings = {};
        this.getMappings(huffman_encoder, "");

        // for abcaaab -> 0 01 11 0 0 0 01
        let binary_string = "";
        for(let i=0;i<data.length;i++) {
            binary_string = binary_string + this.mappings[data[i]];
        }

        // we have to store back those bits in computer
        // so need to convert 8 bits to 
        // this code gives the padding of remaining 8 bits
        let rem = (8 - binary_string.length%8)%8;
        let padding = "";
        for(let i=0;i<rem;i++)
            padding = padding + "0";
        binary_string = binary_string + padding;

        // conveting 8 bits each to a charcater
        // and store in result
        let result = "";
        for(let i=0;i<binary_string.length;i+=8){
            let num = 0;
            for(let j=0;j<8;j++){
                num = num*2 + (binary_string[i+j]-"0");
            }
            result = result + String.fromCharCode(num);
        }

        // not only we have reduced the size of text
        // but also made it encripted
        // rem -> no of padding bits
        // result -> data to be decrypted
        // huffman_encoder -> which will help me to decrypt
        let final_res = this.stringify(huffman_encoder) + '\n' + rem + '\n' + result;
        let info = "Compression Ratio : " + data.length/final_res.length;
        info = "Compression complete and file sent for download" + '\n' + info;
        return [final_res, this.display(huffman_encoder, false), info];
    }
}