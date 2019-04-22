import java.io.IOException;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Mapper.Context;

public class Diff1Mapper extends Mapper<LongWritable, Text, Text, Text>{
	public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
		
		// parse input file
		String line = value.toString();
		String[] arr1 = line.split("\t");
		
		String keyNode = arr1[0];
		String edgesLabels = arr1[1];
		
		// Only output if the node contains labels
		String[] arr2 = edgesLabels.split(";");
		if (arr2.length > 1) {
			String[] labels = arr2[1].split("\\s+");
			for (String s : labels) {				
				context.write(new Text(keyNode), new Text(s));
			}
		}
	}
}
