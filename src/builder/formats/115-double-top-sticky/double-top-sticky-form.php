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
    <p class="h5 left" style='margin-top:14px'>#115 - Double Top Sticky</p>
</div></div>

<div class="row">
<div class='col-lg-6 col-md-6'>
<br>
<form id=builderForm enctype="multipart/form-data" onsubmit="return false">
	<input type="hidden" name="format" value='double-top-sticky'>
	<table>
		<tr><td>Creative Width:</td>
			<td><select type="text" id='width' name="width" class="form-control">
				<option value='320'>320</option>
				<option value='360'>360</option>
				<option value='970'>970</option>
				<option value='900'>900</option>
				<option value='728'>728</option>
			    </select> 
			</td></tr>
		<tr><td>Inline Height:</td>
			<td><select type="text" id='inline_height' name="inline_height" class="form-control">
				<option value='50'>50</option>
				<option value='60'>60</option>
				<option value='80'>80</option>
				<option value='90'>90</option>
				<option value='100'>100</option>
			    </select> 
			</td></tr>
		<tr><td>Sticky Height:</td>
			<td><select type="text" id='sticky_height' name="sticky_height" class="form-control">
				<option value='50'>50</option>
				<option value='60'>60</option>
				<option value='80'>80</option>
				<option value='90'>90</option>
				<option value='100'>100</option>
			    </select>
			</td></tr>

		<tr><td>Inline zip or image:</td>
			<td><input type="file" name='inline_zip'></td></tr>

		<tr><td>Sticky zip or image:</td>
			<td><input type="file" name='sticky_zip'></td></tr>

		<tr><td>Create ClickTag Layer:</td>
			<td><select type="text" id="form3" name='clicktag_layer' class="form-control">
		    	<option value="1">Yes</option>
		    	<option value="0">No</option>
		   	</select>
   			</td></tr>

		<tr><td>Clicktag URL:</td>
			<td><input type="text" value='www.google.com' name='clicktag_url'></td></tr>

		<tbody style='display:none'><tr><td>Floating Inline:</td>
			<td><select type="text" id="floating_inline" name='floating_inline' class="form-control" onchange='changes()'>
		    	<option value="1">Yes</option>
		    	<option value="0" selected>No</option>
		   	</select>
   			</td></tr></tbody>

		<tbody id='floatingInlineSection'>
			<tr><td>Insert Inline position:</td>
			<td><select type="text" id="inline_position" name='inline_position' class="form-control">
		    	<option value="beforebegin" selected>before begin</option>
		    	<option value="afterbegin">after begin</option>
		    	<option value="beforeend">before end</option>
		    	<option value="afterend" selected>after end</option>
		   	</select></td></tr>
			<tr><td>Insert Inline div ID:</td>
			<td><input type="text" id='inline_position_div_id' name="inline_position_div_id" class="form-control">
			</td></tr>
		</tbody>

		<tr><td>Animated sticky:</td>
			<td><select type="text" id="form3" name='animated_transition' class="form-control">
		    	<option value="1" selected>Yes, 0.25 seconds</option>
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
function changes() {
  if(document.getElementById("floating_inline").value=="1") {
	document.getElementById("floatingInlineSection").style.display="";
  } else {
	document.getElementById("floatingInlineSection").style.display="none";
  }
}
changes();
</script>