import java.io.IOException;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Mapper.Context;

public class Iter1Mapper extends Mapper <LongWritable, Text, Text, Text> {
	public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
		
		// parse input file
		String line = value.toString();
		String[] arr1 = line.split("\t");
		
		// from Node
		String fromNode = arr1[0];
		String edgeLabel = arr1[1];
		
		
		// shadow vertex which used up its weight (after first iter)
		if (fromNode.charAt(fromNode.length() - 1) == '\'') {
			String labelNode = fromNode.substring(0, fromNode.length() - 1);
			Double labelVal = 1.0;
			if (edgeLabel.charAt(edgeLabel.length() - 1) == ';') {
				edgeLabel += labelNode + "," + labelVal.toString();
			}
		}
		
		String[] edgesLabels = edgeLabel.split(";");
		
		String edges = edgesLabels[0];	
		
		// Emit the edges of current node
		if (!edges.equals("")) {
			context.write(new Text(fromNode), new Text(";" + edges));
		}
		
		// has label weights to propagate
		if (edgesLabels.length > 1) {
		String labels = edgesLabels[1];
		
		// Iterate the labels and propagate weights
		String[] edgesArr = edges.split("\\s+");
		String[] labelsArr = labels.split("\\s+");
		
		for (int i = 0; i < labelsArr.length; i++) {
			String[] label = labelsArr[i].split(",");
			String labelNode = label[0];
			Double labelVal = Double.parseDouble(label[1]);
			for (int j = 0; j < edgesArr.length; j++) {
				String[] edge = edgesArr[j].split(",");
				String edgeNode = edge[0];
				Double edgeVal = Double.parseDouble(edge[1]);
				
				// new weight
				Double newWeight = labelVal * edgeVal;
				
				context.write(new Text(labelNode), new Text(newWeight.toString() + " " + edgeNode));
				
			}
		}
		}
	}
}