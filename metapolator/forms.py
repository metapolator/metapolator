import re

from web.form import Form, Textbox, Dropdown, Button, Validator, Password, \
    notnull, Hidden

import models


CHOICES = [('select', 'select'), ('startp', 'startp'),
           ('doubledash', 'doubledash'), ('tripledash', 'tripledash'),
           ('superleft', 'superleft'), ('superright', 'superright'),
           ('leftp', 'leftp'), ('rightp', 'rightp'),
           ('downp', 'downp'), ('upp', 'upp'),
           ('dir', 'dir'), ('leftp2', 'leftp2'),
           ('rightp2', 'rightp2'), ('downp2', 'downp2'),
           ('upp2', 'upp2'), ('dir2', 'dir2'),
           ('tension', 'tension'), ('tensionand', 'tensionand'),
           ('cycle', 'cycle'), ('penshifted', 'penshifted'),
           ('pointshifted', 'pointshifted'), ('angle', 'angle'),
           ('penwidth', 'penwidth'), ('overx', 'overx'),
           ('overbase', 'overbase'), ('overcap', 'overcap'),
           ('overasc', 'overasc'), ('overdesc', 'overdesc'),
           ('ascpoint', 'ascpoint'), ('descpoint', 'descpoint'),
           ('stemcutter', 'stemcutter'), ('stemshift', 'stemshift'),
           ('inktrap_l', 'inktrap_l'), ('inktrap_r', 'inktrap_r')]


ParamForm = Form(Dropdown('select', CHOICES, description="Parameter"),
                 Textbox('value', size=15, description="Value", id="parmvaltext"),
                 Button('save'))


GlobalParamForm = Form(Dropdown('idglobal', [], description='Choose parameter set'),
                       Textbox('metapolation', notnull, size=5,
                               description="metapolation", value="0.5"),
                       Textbox('fontsize', notnull, size=5,
                               description="fontsize", value="10"),
                       Textbox('mean', notnull, size=5,
                               description="mean", value="0.5"),
                       Textbox('cap', notnull, size=5,
                               description="cap", value="0.8"),
                       Textbox('ascl', notnull, size=5,
                               description="asc", value="0.2"),
                       Textbox('des', notnull, size=5,
                               description="desc", value="0.2"),
                       Textbox('box', notnull, size=5,
                               description="box", value="1"),
                       Button('save', value='Save Parameter Set'))


LocalParamForm = Form(Dropdown('idlocal', [], description='Choose parameter set'),
                      Textbox('px', notnull, size=5,
                              description="px", value="1"),
                      Textbox('width', notnull, size=5,
                              description="width", value="1"),
                      Textbox('space', notnull, size=5,
                              description="space", value="0"),
                      Textbox('xheight', notnull, size=5,
                              description="xheight", value="10"),
                      Textbox('capital', notnull, size=5,
                              description="capital", value="10"),
                      Textbox('boxheight', notnull, size=5,
                              description="boxheight", value="10"),
                      Textbox('ascender', notnull, size=5,
                              description="ascender", value="10"),
                      Textbox('descender', notnull, size=5,
                              description="descender", value="10"),
                      Textbox('inktrap', notnull, size=5,
                              description="inktrap", value="10"),
                      Textbox('stemcut', notnull, size=5,
                              description="stemcut", value="10"),
                      Textbox('skeleton', notnull, size=5,
                              description="skeleton", value="10"),
                      Textbox('superness', notnull, size=5,
                              description="superness", value="30"),
                      Textbox('over', notnull, size=5,
                              description="over", value="0.05"),
                      Hidden('ab_source', notnull, value='a'),
                      Button('save'))


def validate_existing_user(item):
    usernamecase = models.User.get(username=item.username)
    emailcase = models.User.get(email=item.email)
    return not bool(usernamecase) and not bool(emailcase)


def vemail(value):
    user_regex = re.compile(
        r"(^[-!#$%&'*+/=?^_`{}|~0-9A-Z]+(\.[-!#$%&'*+/=?^_`{}|~0-9A-Z]+)*$"
        r"|^\"([\001-\010\013\014\016-\037!#-\[\]-\177]|\\[\001-\011\013\014\016-\177])*\"$)",
        re.IGNORECASE)
    domain_regex = re.compile(
        r'(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}|[A-Z0-9-]{2,})\.?$'
        # literal form, ipv4 address (SMTP 4.1.3)
        r'|^\[(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}\]$',
        re.IGNORECASE)
    if not value or '@' not in value:
        return False
    user_part, domain_part = value.rsplit('@', 1)

    if not user_regex.match(user_part):
        return False

    if not domain_regex.match(domain_part):
        return False

    return True


RegisterForm = Form(Textbox("username", notnull, description="Username"),
                    Textbox("email", Validator("Invalid email", vemail),
                            description="E-Mail"),
                    Password("password", notnull, description="Password"),
                    Password("password2", notnull, description="Repeat password"),
                    Button("submit", type="submit", description="Register"),
                    validators=[Validator("Passwords did't match",
                                          lambda i: i.password == i.password2),
                                Validator("User with this email or username already registered",
                                          validate_existing_user)])
