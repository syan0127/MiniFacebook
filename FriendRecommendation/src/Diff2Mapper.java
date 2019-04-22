import java.io.IOException;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Mapper.Context;

public class Diff2Mapper extends Mapper<LongWritable, Text, Text, Text> {
	public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
		
		// parse input file
		String line = value.toString();
		String[] nodes = line.split("\t");
		String rankDiff = nodes[1];
		
		// map to same key for calculating max ouput
		context.write(new Text(""), new Text(rankDiff));	
	}
}
