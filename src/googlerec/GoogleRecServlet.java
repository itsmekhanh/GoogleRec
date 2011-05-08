package googlerec;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;


import javax.servlet.http.*;

import java.io.File;
import java.net.URL;
import java.net.URLConnection;
import java.util.Vector;
import java.util.regex.*;
import org.w3c.dom.*;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.ParserConfigurationException;

import org.xml.sax.SAXException;
import org.xml.sax.SAXParseException; 

@SuppressWarnings("serial")
public class GoogleRecServlet extends HttpServlet {
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
		final int MAX_IMAGE = 10;
		
		//System.out.println("In servlet");
		String results = "";
		String item = "";
		String htmlContent = "";
		String html_temp = "";
		String imageLink = "";
		String finalQuery = "";
		String query= req.getParameter("word");
	    String googleImageBaseURL = "http://www.google.com/images?q=";
	    
	    
	    Pattern regex = Pattern.compile("=http://\\S+?(png|gif|jpg|jpeg)", Pattern.CASE_INSENSITIVE); 
        Matcher m;
		
		queries = new Vector<String>();
		choices = new Vector<String>();
		ret = new Vector<String>();
		
		query = parseQuery(query);
		

		try {
			DocumentBuilderFactory docBuilderFactory = DocumentBuilderFactory.newInstance();
			DocumentBuilder docBuilder = docBuilderFactory.newDocumentBuilder();
			
			// grab URL
			URL url = new URL("http://google.com/complete/search?output=toolbar&q="+query);
			InputStream stream = url.openStream();
			Document doc = docBuilder.parse(stream);
			
			// now that we have the XML document, let's grab elements
			doc.getDocumentElement().normalize();
			
			NodeList listOfResults = doc.getElementsByTagName("CompleteSuggestion");
			
			for(int i=0; i<listOfResults.getLength(); i++){
				item = ""+listOfResults.item(i).getFirstChild().getAttributes().item(0);
				
				// grab the next word
				item = parseData(item);
				if(!item.equals("")){
						//results = results+"<span style=\"padding: 10px\">"+item+"</span>";
					ret.add(item);
				}
				//results = results+listOfResults.item(i).getFirstChild().getAttributes().item(0)+"\n";
			}			
			//System.out.println(results);
		} catch (ParserConfigurationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SAXException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		//outputs the code
		//System.out.println(ret.size());
		Object[] results_array = ret.toArray();
		if(results_array.length>1){
			for(int j=0; j<results_array.length-1; j++){
				results = results+results_array[j]+",";
			}
			results = results+results_array[results_array.length-1];
			//System.out.println(results);
		}
		else if (results_array.length == 1)
			results = results_array[0]+"";
		if(results.equals("")){
			//System.out.println("WORD IS FOUND!\nquery is: "+query);
		    // word is found, now output a corresponding image with link
		    URL imageURL = new URL(googleImageBaseURL+query);
		    URLConnection con = imageURL.openConnection();
            BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
		
            while( (html_temp = in.readLine()) != null){
                htmlContent = htmlContent+html_temp+"\n";
            }
            //System.out.println(htmlContent);
            m = regex.matcher(htmlContent);
            int count = 0;
            imageLink = "";
            while(m.find()){
                imageLink = imageLink+m.group().substring(1)+",";
        		//System.out.println("image is: "+imageLink);
        		count++;
        		if(count == MAX_IMAGE)
        			break;
            }
            imageLink = imageLink.substring(0, imageLink.length()-1);
            finalQuery = query;
            htmlContent = "";
		}
		//System.out.println("image is: "+imageLink);
		resp.setContentType("text/plain");
		resp.getWriter().write(results+"|"+imageLink+"|"+finalQuery);
	}
	
	static private String parseData(String s){
		int first = s.indexOf("\"")+1;
		int last = s.lastIndexOf("\"");
		//System.out.println("parsing data at: "+first+" and "+last);
		
		s = s.substring(first, last);
		String[] words = s.split(" ");
		for(int i=0; i<words.length; i++)
		{
			if(!queries.contains(words[i]) && !choices.contains(words[i]) )
			{
				choices.add(words[i]);
				return words[i];
			}
		}
		return "";
	}
	
	static private String parseQuery(String q){
		String words[] = q.split(" ");
		
		// grab first word
		String result = words[0];
		queries.add(words[0]);
		
		for(int i=1; i<words.length; i++){
			queries.add(words[i]);
			result=result+"+"+words[i];
		}	
		return result;
	}
	
	
	//private instances
	private static Vector<String> queries;
	private static Vector<String> choices;
	private static Vector<String> ret;
}