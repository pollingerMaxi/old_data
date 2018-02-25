<!-- Contact form -->
<style>
td {height:50px;}
table { width:90%;}
.site-content {background-image:url(img/blue-bg.jpg);width:100%;
		height:200px;padding-top:90px;font-size:20px }
</style>
<main>
<div class="container">

<div class="row mt-5">
<div class='col-lg-12 col-md-12'>
    <p class="h5 left" style='margin-top:14px'>#109 - Expanding Footer</p>
</div></div>

<div class="row">
<div class='col-lg-6 col-md-6'>
<form id=builderForm enctype="multipart/form-data" onsubmit="return false">
<br>

	<table>
		<input type="hidden" name="format" value='footer-expand'>
<!--		<input type="hidden" name="collapsed_size" value='970x90'>
		<input type="hidden" name="expanded_size" value='970x250'>

		<tr><td>Collapsed Size:</td>
			<td><select type="text" name="collapsed_size" class="form-control">
				<option>970x90</option></select>
			</td></tr>

		<tr><td>Expanded Size:</td>
			<td><select type="text" name="expanded_size" class="form-control">
				<option>970x250</option></select>
			</td></tr>
-->		
		<tr><td>Creative Width:</td>
			<td><select type="text" id='width' name="width" class="form-control">
				<option value='970'>970</option>
				<option value='900'>900</option>
				<option value='728'>728</option>
			    </select> 
			</td></tr>
		<tr><td>Collapsed Height:</td>
			<td><select type="text" id='collapsed_height' name="collapsed_height" class="form-control">
				<option value='60'>60</option>
				<option value='80'>80</option>
				<option value='90'>90</option>
			    </select> 
			</td></tr>
		<tr><td>Expanded Height:</td>
			<td><select type="text" id='expanded_height' name="expanded_height" class="form-control">
				<option value='250'>250</option>
				<option value='251'>251</option>
				<option value='200'>200</option>
			    </select>
			</td></tr>
      <tr><td colspan=2>** The creative size in DFP must be this Expanded Height.
			    <br>&nbsp; </td></tr>


		<tr><td>Collapsed zip or image:</td>
			<td><input type="file" name='collapsed_zip'></td></tr>

		<tr><td>Expanded zip or image:</td>
			<td><input type="file" name='expanded_zip'></td></tr>

		<tr><td>Expand Action:</td>
			<td><select type="text" id='expand_action' name="expand_action" class="form-control" onchange='expandAction()'>
				<option selected value='click'>expand button click</option>
				<option value='mouseover'>mouseOver, wait X seconds</option>
			    </select>
			</td></tr>

		<tbody id='expand_seconds_block' style='display:none'><tr><td>Expand Seconds:</td>
			<td><input type="text" value='5' name='expand_seconds'></td></tr></tbody>

		<tr><td>Create ClickTag Layer:</td>
			<td><select type="text" id="form3" name='clicktag_layer' class="form-control">
		    	<option value="1">Yes</option>
		    	<option value="0">No</option>
		   	</select>
   			</td></tr>

		<tr><td>Clicktag URL:</td>
			<td><input type="text" value='www.google.com' name='clicktag_url'></td></tr>

		<tr><td>Animated transition:</td>
			<td><select type="text" id="form3" name='animated_transition' class="form-control">
		    	<option value="1">Yes, 0.25 seconds</option>
		    	<option value="2">Yes, 0.5 seconds</option>
		    	<option value="3">Yes, 0.75 seconds</option>
		    	<option value="4">Yes, 1 second</option>
		    	<option value="0">No</option>
		   	</select>
   			</td></tr>


	</table>

    <div class="text-center">
        <button onclick='w.builder.submit()' class="btn btn-primary">Upload and generate Creative</button>
         <div id='downloadButton'></div>
    </div>

</form>
</div>
</div><!-- mainPage -->


</div>
</main>

<script>
function expandAction() {
  document.getElementById("expand_seconds_block").style.display = (document.getElementById("expand_action").value=="mouseover" ? "" : "none");

}</script>