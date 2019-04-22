
import java.io.IOException;
import java.util.*;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

public class Iter1Reducer extends Reducer<Text, Text, Text, Text> {
	public void reduce(Text key, Iterable<Text> values, Context context) throws IOException, InterruptedException {
		
		
		
		Double value = 0.0;
		List<String> list = new ArrayList<>();
		
		// emit edge list + sum values for normalizing
		for (Text text : values) {
			
			String line = text.toString();
			
			// this is edge list
			if (line.contains(";")) {
				context.write(key, text);
				continue;
			}
			
			// for second iteration
			list.add(line);
						
			String[] label = line.split("\\s+");
			
			value += Double.parseDouble(label[0]);
			
		}
		
		for (String s : list) {
			String[] label = s.split("\\s+");
						
			Double currentVal = Double.parseDouble(label[0]);
			Double normalizedVal = currentVal / value;
			
			context.write(new Text(label[1]),
					new Text(key.toString() + "," + normalizedVal.toString()));
		}
	}
}
