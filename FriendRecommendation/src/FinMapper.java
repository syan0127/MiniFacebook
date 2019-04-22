import java.io.IOException;

import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Mapper.Context;

public class FinMapper extends Mapper<LongWritable, Text, Text, Text>{
	public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
		
		// parse input file
		String line = value.toString();
		String[] arr = line.split("\t");
		String keyNode = arr[0];
		
		String[] edgesLabels = arr[1].split(";");
		
		if (edgesLabels.length > 1) {
			String[] labels = edgesLabels[1].split("\\s+");
			for (String label : labels) {
				context.write(new Text(keyNode), new Text(label));
			}
		}
	}
}