import java.io.IOException;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Mapper.Context;

public class Iter2Mapper extends Mapper <LongWritable, Text, Text, Text> {
	public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
		
		// parse input file
		String line = value.toString();
		
		String[] arr1 = line.split("\t");
		
		context.write(new Text(arr1[0]), new Text(arr1[1]));
		
	}
}