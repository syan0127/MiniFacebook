import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;

public class InitReducer extends Reducer<Text, Text, Text, Text> {
	public void reduce(Text key, Iterable<Text> values, Context context) throws IOException, InterruptedException {
		
		// Key: from. value: to.
		// build list of edges; add shadow vertex
		StringBuilder sb = new StringBuilder();
		StringBuilder shadowV = new StringBuilder();
		// number of values necessary to calculate initial weight
		ArrayList<String> friends = new ArrayList();
		boolean attribute = false;
		
		for (Text value : values) {
			if (attribute || value.toString().charAt(0) == '!') {
				attribute = true;
				friends.add(value.toString().substring(1));
			} else {
				friends.add(value.toString());
			}
		}
		
		float weight = 1.0f / friends.size();
		
		for (String friend : friends) {
			System.out.println("!!!Adding: " + friend.toString() + "for user: " + key.toString());
			sb.append(friend);
			sb.append(",");
			sb.append(weight);
			sb.append(" ");
		}
		System.out.println("!!!Assembled: " + sb.toString() + "for user: " + key.toString());
		sb.deleteCharAt(sb.length()-1);
		if (attribute) {
			// write only with edges
			context.write(key, new Text(sb.toString()));
		} else {
			// attach label and shadow vertex
			sb.append(';');
			sb.append(key + ",1.0");
			shadowV.append(key);
			shadowV.append(",1.0;");
			shadowV.append(key);
			shadowV.append(",1.0");
			context.write(key, new Text(sb.toString()));
			context.write(new Text(key+"'"), new Text(shadowV.toString()));
		}
	}
}

