import java.io.IOException;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;

public class Diff2Reducer extends Reducer<Text, Text, Text, Text> {
	public void reduce(Text key, Iterable<Text> values, Context context) throws IOException, InterruptedException {
		
		Double globalMax = Double.MIN_VALUE;
		
		for (Text value : values) {
			Double val = Double.parseDouble(value.toString());
			if (val > globalMax) {
				globalMax = val;
			}
		}
		context.write(new Text(""), new Text(globalMax.toString()));
	}
}
