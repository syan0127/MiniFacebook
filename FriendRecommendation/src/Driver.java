
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URI;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FileStatus;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

public class Driver
{
  public static void main(String[] args) throws Exception 
  {
    if (args[0].equals("iter")) {
    	System.exit(iter(args[1], args[2], args[3]));
	}
    else if (args[0].equals("diff")) {
    	System.exit(diff(args[1], args[2], args[3], args[4]));
    }
    else if (args[0].equals("finish")) {
    	System.exit(finish(args[1], args[2], args[3]));
    }
    else if (args[0].equals("composite")) {
    	System.exit(composite(args[1], args[2], args[3], args[4], args[5], args[6]));
    } else if (args[0].equals("init")) {
    	System.exit(init(args[1], args[2], args[3]));
    }
  }
  
  static int init(String input, String output, String numReducer) throws Exception {
	 
	  // Print out the name first
	  System.out.println("INIT");
		  
	  // delete existing output directory
	  deleteDirectory(output);
	  
	  // map reduce code
	  Job job = Job.getInstance();
	  job.setJarByClass(Driver.class);
	  
	  FileInputFormat.addInputPath(job, new Path(input));
	  FileOutputFormat.setOutputPath(job, new Path(output));
	  
	  job.setMapperClass(InitMapper.class);
	  job.setReducerClass(InitReducer.class);
	  
	  // set the number of reducers for the task
	  job.setNumReduceTasks(Integer.parseInt(numReducer));
	  
	  job.setMapOutputKeyClass(Text.class);
	  job.setMapOutputValueClass(Text.class);
	  
	  job.setOutputKeyClass(Text.class);
	  job.setOutputValueClass(Text.class);
	  
	  
	  return job.waitForCompletion(true) ? 0 : 1;
  }
  
  static int iter(String input, String output, String numReducer) throws Exception {
	  
	  // Print out the name first
	  System.out.println("Yeon Sang Jung");
	  
	  deleteDirectory(output);
	  
	  Job job1 = new Job();
	  job1.setJarByClass(Driver.class);
	  
	  FileInputFormat.addInputPath(job1, new Path(input));
	  FileOutputFormat.setOutputPath(job1, new Path("normalized"));
	  job1.setMapperClass(Iter1Mapper.class);
	  job1.setReducerClass(Iter1Reducer.class);
	  
	  job1.setNumReduceTasks(Integer.parseInt(numReducer));
	  
	  job1.setMapOutputKeyClass(Text.class);
	  job1.setMapOutputValueClass(Text.class);
	  
	  job1.setOutputKeyClass(Text.class);
	  job1.setOutputValueClass(Text.class);
	  	  
	  if (job1.waitForCompletion(true)) {
		  Job job2 = new Job();
		  job2.setJarByClass(Driver.class);
		  
		  FileInputFormat.addInputPath(job2, new Path("normalized"));
		  FileOutputFormat.setOutputPath(job2, new Path(output));
		  
		  job2.setMapperClass(Iter2Mapper.class);
		  job2.setReducerClass(Iter2Reducer.class);
		  
		  job2.setNumReduceTasks(Integer.parseInt(numReducer));
		  
		  job2.setMapOutputKeyClass(Text.class);
		  job2.setMapOutputValueClass(Text.class);
		  
		  job2.setOutputKeyClass(Text.class);
		  job2.setOutputValueClass(Text.class);
		  
		  if (job2.waitForCompletion(true)) {
			  deleteDirectory("normalized");
			  return 0;			  
		  }
		  else {
			  deleteDirectory("normalized");
			  return 1;
		  }
	  }
	  else {
		  deleteDirectory("normalized");
		  return 1;
	  }	  
  }
  
  static int diff(String input1, String input2, String output, String numReducer) throws Exception {
	  
	  // Print out the name first
	  System.out.println("Yeon Sang Jung");
	  
	  // delete output directory first
	  deleteDirectory(output);
	  
	  Job job1 = new Job();
	  //job1.setJarByClass(SocialRankDriver.class);
	  FileInputFormat.addInputPath(job1, new Path(input1));
	  FileInputFormat.addInputPath(job1, new Path(input2));

	  FileOutputFormat.setOutputPath(job1, new Path("temp"));
	  
	  job1.setMapperClass(Diff1Mapper.class);
	  job1.setReducerClass(Diff1Reducer.class);
	  
	  job1.setNumReduceTasks(Integer.parseInt(numReducer));
	  
	  job1.setMapOutputKeyClass(Text.class);
	  job1.setMapOutputValueClass(Text.class);
	  
	  job1.setOutputKeyClass(Text.class);
	  job1.setOutputValueClass(Text.class);
	  
	  if (job1.waitForCompletion(true)) {
		  Job job2 = new Job();
		  job2.setJarByClass(Driver.class);
		  
		  FileInputFormat.addInputPath(job2, new Path("temp"));
		  FileOutputFormat.setOutputPath(job2, new Path(output));
		  
		  job2.setMapperClass(Diff2Mapper.class);
		  job2.setReducerClass(Diff2Reducer.class);
		  
		  job2.setNumReduceTasks(Integer.parseInt(numReducer));
		  
		  job2.setMapOutputKeyClass(Text.class);
		  job2.setMapOutputValueClass(Text.class);
		  
		  job2.setOutputKeyClass(Text.class);
		  job2.setOutputValueClass(Text.class);
		  
		  if (job2.waitForCompletion(true)) {
			  deleteDirectory("temp");
			  return 0;			  
		  }
		  else {
			  deleteDirectory("temp");
			  return 1;
		  }
	  }
	  else {
		  deleteDirectory("temp");
		  return 1;
	  }	  
  }
  
  static int finish(String input, String output, String numReducer) throws Exception {
	  // Print out the name first
	  System.out.println("Yeon Sang Jung");
		  
	  deleteDirectory(output);
	  
	  Job job = new Job();
	  job.setJarByClass(Driver.class);
	  
	  FileInputFormat.addInputPath(job, new Path(input));
	  FileOutputFormat.setOutputPath(job, new Path(output));
	  
	  job.setMapperClass(FinMapper.class);
	  job.setReducerClass(FinReducer.class);
	  
	  job.setNumReduceTasks(Integer.parseInt(numReducer));
	  
	  job.setMapOutputKeyClass(Text.class);
	  job.setMapOutputValueClass(Text.class);
	  
	  job.setOutputKeyClass(Text.class);
	  job.setOutputValueClass(Text.class);
	  	  
	  return job.waitForCompletion(true) ? 0 : 1;
  }
  
  static int composite(String input, String output, String interm1, String interm2,
		  String diff, String numReducer) throws Exception {
	  // Print out the name first
	  System.out.println("Yeon Sang Jung");
			  
	  deleteDirectory(output);
	  
	  // first init
	  init(input, interm1, numReducer);
	  
	  Double difference = 31.0;
	  
	  while (difference > 0.01) {
		  // 3 iteration of iter
		  iter(interm1, interm2, numReducer);
		  iter(interm2, interm1, numReducer);
		  iter(interm1, interm2, numReducer);
		  diff(interm1, interm2, diff, "1");
		  difference = readDiffResult(diff);
	  }
	  
	  // interm2 to output folder
	  int returnVal = finish(interm2, output, "1");
	  
	  // intermediate directories
	  deleteDirectory(diff);
	  deleteDirectory(interm1);
	  deleteDirectory(interm2);
	  
	  return returnVal; 
  }

  // Given an output folder, returns the first double from the first part-r-00000 file
  static double readDiffResult(String path) throws Exception 
  {
    double diffnum = 0.0;
    Path diffpath = new Path(path);
    Configuration conf = new Configuration();
    FileSystem fs = FileSystem.get(URI.create(path),conf);
    
    if (fs.exists(diffpath)) {
      FileStatus[] ls = fs.listStatus(diffpath);
      for (FileStatus file : ls) {
	if (file.getPath().getName().startsWith("part-r-00000")) {
	  FSDataInputStream diffin = fs.open(file.getPath());
	  BufferedReader d = new BufferedReader(new InputStreamReader(diffin));
	  String diffcontent = d.readLine();
	  diffnum = Double.parseDouble(diffcontent);
	  d.close();
	}
      }
    }
    
    fs.close();
    return diffnum;
  }

  static void deleteDirectory(String path) throws Exception {
    Path todelete = new Path(path);
    Configuration conf = new Configuration();
    FileSystem fs = FileSystem.get(URI.create(path),conf);
    
    if (fs.exists(todelete)) 
      fs.delete(todelete, true);
      
    fs.close();
  }

}