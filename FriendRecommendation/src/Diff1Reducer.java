import java.io.IOException;
import java.util.*;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;

public class Diff1Reducer extends Reducer<Text, Text, Text, Text> {
	public void reduce(Text key, Iterable<Text> values, Context context) throws IOException, InterruptedException {
		
		Map<String, Double> map = new HashMap<>();
		
		// We would have 2 values from 2 different input files
		for (Text value : values) {
			
			String line = value.toString();
			String labelNode = line.split(",")[0];
			Double labelVal = Double.parseDouble(line.split(",")[1]);
			
			if (!map.containsKey(labelNode)) {
				map.put(labelNode, labelVal);
			}
			else {
				map.put(labelNode, Math.abs(map.get(labelNode) - labelVal));
			}
		}
		
		Double out = 0.0;
		for (Map.Entry<String, Double> entry : map.entrySet()) {
			out = Math.max(out, entry.getValue());
		}

		// absolute value of the difference between two values
		context.write(key, new Text(Double.toString(out)));
	}
}
