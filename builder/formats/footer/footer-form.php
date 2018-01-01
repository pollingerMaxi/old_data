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
    <p class="h5 left" style='margin-top:14px'>Fixed Footer</p>
</div></div>

<div class="row">
<div class='col-lg-6 col-md-6'>
<form id=builderForm enctype="multipart/form-data" onsubmit="return false">
<br>

	<table> 
		<input type="hidden" name="format" value='footer'>

		<tr><td>HTML5 zip or image:</td>
			<td><input type="file" name='zipfile'></td></tr>

		<tr><td>Size:</td>
			<td><select type="text" id='size' name="size" class="form-control">
				<option value='970x90'>970x90</option>
				<option value='940x80'>940x80</option>
				<option value='320x50'>320x50</option>
			    </select>
			</td></tr>

		<tr><td>Clicktag URL:</td>
			<td><input type="text" value='www.google.com' name='clicktag_url'></td></tr>

		<tr><td>Add clicktag Layer</td>
			<td><select type='text' name='clicktag_layer' class='form-control'>
 				<option value='1' selected>Yes</option>
				<option value='0'>No</option>
				</select>
			</td></tr>

  	    <tr><td>Autoclose timeout (0 = no close):</td>
			<td><input type="text" value='0' name='autoclose'></td></tr>


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