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
    <p class="h5 left" style='margin-top:14px'>#100 - HTML5</p>
</div></div>

<div class="row">
<div class='col-lg-6 col-md-6'>
<form id=builderForm enctype="multipart/form-data" onsubmit="return false">
<br>

	<table>
		<input type="hidden" name="width" value='970x90'>
		<input type="hidden" name="height" value='970x250'>
		<input type="hidden" name="format" value='html5'>

		<tr><td>Size:</td>
			<td><select type="text" id='size' name="size" class="form-control">
				<option value='160x600'>160x600</option>
				<option value='260x600'>260x600</option>
				<option value='260x800'>260x800</option>
				<option value='300x125'>300x125</option>
				<option value='300x250'>300x250</option>
				<option value='300x450'>300x450</option>
				<option value='300x600'>300x600</option>
				<option value='320x50'>320x50</option>
				<option value='360x50'>360x50</option>
				<option value='360x100'>360x100</option>
				<option value='728x90'>720x90</option>
				<option value='970x90'>970x90</option>
				<option value='970x250'>970x250</option>
				<!--<option value='fullscreen'>Fullscreen</option>-->
			    </select> 
			</td></tr>

<!--
		<tr><td>Collapsed Size:</td>
			<td><select type="text" name="collapsed_size" class="form-control">
				<option>970x90</option></select>
			</td></tr>

		<tr><td>Expanded Size:</td>
			<td><select type="text" name="expanded_size" class="form-control">
				<option>970x250</option></select>
			</td></tr>
-->		
		<tr><td>Zipfile</td>
			<td><input type="file" name='zipfile'></td></tr>

<!--
		<tr><td>Expand button text or base64 image:</td>
			<td><input type="text" value='Abrir' name='expand_button'></td></tr>

		<tr><td>Collapse button text or base64 image:</td>
			<td><input type="text" value='Cerrar' name='collapse_button'></td></tr>
-->
		<tr><td>Create ClickTag Layer:</td>
			<td><select type="text" id="form3" name='clicktag_layer' class="form-control">
		    	<option value="1">Yes</option>
		    	<option value="0">No</option>
		   	</select>
   			</td></tr>

		<tr><td>Clicktag URL:</td>
			<td><input type="text" value='www.google.com' name='clicktag_url'></td></tr>

<!--		<tr><td>Background Color:</td>
			<td><input type="text" value='white'></td></tr>
-->

	</table>

    <div class="text-center">
        <button onclick='w.builder.submit()' class="btn btn-primary">Upload and generate Creative <i class="fa fa-paper-plane-o ml-1"></i></button>
         <div id='downloadButton'></div>
    </div>

</form>
</div>
</div><!-- mainPage -->


</div>
</main>