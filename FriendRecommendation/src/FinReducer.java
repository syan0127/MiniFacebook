import java.io.IOException;
import java.util.*;

import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;

public class FinReducer extends Reducer<Text, Text, Text, Text>{
	public void reduce(Text key, Iterable<Text> values, Context context) throws IOException, InterruptedException {
		
		List<Double> list = new ArrayList<>();
		Map<Double, String> map = new HashMap<>();
		
		String out = "";
		
		for (Text value : values) {
			String line = value.toString();
			String labelNode = line.split(",")[0];
			Double labelVal = Double.parseDouble(line.split(",")[1]);
			
			if (!list.contains(labelVal)) {
				list.add(labelVal);
			}
			if (!map.containsKey(labelVal)) {
				map.put(labelVal, labelNode);
			}
			else {
				map.put(labelVal, map.get(labelVal) + " " + labelNode);
			}
		}
		
		Collections.sort(list, Collections.reverseOrder());
		
		for (Double d : list) {
			out += map.get(d) + " ";
		}
		
		context.write(key, new Text(out.substring(0, out.length() - 1)));
	}
}
