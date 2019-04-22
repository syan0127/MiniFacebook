import java.io.IOException;
import java.util.*;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

public class Iter2Reducer extends Reducer<Text, Text, Text, Text> {
	public void reduce(Text key, Iterable<Text> values, Context context) throws IOException, InterruptedException {
		
		String toOutput = "";
		
		// hashmap to sumup weights for same label nodes
		Map<String, Double> map = new HashMap<>();
		
		// emit edge list + sum values for normalizing
		for (Text text : values) {
			
			String line = text.toString();
			
			// this is edge list
			if (line.contains(";")) {
				toOutput = line.substring(1) + ";" + toOutput;
				continue;
			}
			
			String labelNode = line.split(",")[0];
			Double labelWeight = Double.parseDouble(line.split(",")[1]);
			
			if (!map.containsKey(labelNode)) {
				map.put(labelNode, labelWeight);
			}
			else {
				map.put(labelNode, map.get(labelNode) + labelWeight);
			}
		}
		
		// add summed node, weight pair to the output string
		for (Map.Entry<String, Double> entry : map.entrySet()) {
			String labelNode = entry.getKey();
			String labelWeight = entry.getValue().toString();
			toOutput += labelNode + "," + labelWeight + " ";
		}
		
		// remove the additional space at the end
		if (toOutput.charAt(toOutput.length() - 1) != ';') {
			toOutput = toOutput.substring(0, toOutput.length() - 1);
		}
		
		context.write(key, new Text(toOutput));
	}
}