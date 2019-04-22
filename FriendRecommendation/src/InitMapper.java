import java.io.IOException;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Mapper.Context;

public class InitMapper extends Mapper<LongWritable, Text, Text, Text>{
	public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
		// only output edges with status 3
		
		// parse input file
		String line = value.toString();
		String[] arr1;
		if (line.indexOf('{') != -1) {
			// interests and affiliations file
			arr1 = line.split(",(?=\")");
			String user = arr1[0].substring(1, arr1[0].length()-1);
			String affiliation = arr1[1].substring(1, arr1[1].length()-1);
			String interests[] = arr1[5].substring(3, arr1[5].length()-4).split("\"\"|,");
			if (!affiliation.trim().isEmpty()) {
				context.write(new Text(affiliation), new Text("!"+user));
				context.write(new Text(user), new Text(affiliation));
			}
			for (String interest : interests) {
				if (!interest.trim().isEmpty()) {
					context.write(new Text(interest), new Text("!"+user));
					context.write(new Text(user), new Text(interest));
				}
			}		
		} else {
			arr1 = line.split(",");
			// friendship file
			// "userId (S)","friendId (S)","status (N)"	-- index line
			String status  = arr1[2].substring(1, arr1[2].length() - 1);
			if (Integer.parseInt(status) != 3) {
				return;
			}
			
			String from = arr1[0].substring(1, arr1[0].length()-1);
			String to = arr1[1].substring(1, arr1[1].length()-1);
			context.write(new Text(from), new Text(to));
		}
	}
}
